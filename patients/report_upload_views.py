from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .models import Patient, MedicalRecord
import os
import re
from datetime import datetime

# PDF extraction libraries
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# AI model integration (using OpenAI as example)
try:
    import openai
except ImportError:
    openai = None

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_medical_report(request):
    """
    Upload and analyze medical report PDF
    Extracts text, analyzes with AI, and creates medical record
    """
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if 'patient_id' not in request.data:
        return Response({'error': 'patient_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    patient_id = request.data['patient_id']
    uploaded_file = request.FILES['file']
    
    # Validate file type
    if not uploaded_file.name.endswith('.pdf'):
        return Response({'error': 'Only PDF files are supported'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get patient
    try:
        patient = Patient.objects.get(patient_id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Save file temporarily
    file_path = default_storage.save(f'temp_reports/{uploaded_file.name}', uploaded_file)
    full_path = os.path.join(default_storage.location, file_path)
    
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(full_path)
        
        if not extracted_text:
            return Response({'error': 'Could not extract text from PDF'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clean extracted text
        cleaned_text = clean_medical_text(extracted_text)
        
        # Analyze with AI
        ai_analysis = analyze_with_ai(cleaned_text)
        
        # Create medical record from AI analysis
        medical_record = MedicalRecord.objects.create(
            patient=patient,
            disease=ai_analysis.get('disease', 'Unknown'),
            symptoms=ai_analysis.get('symptoms', 'Extracted from report'),
            diagnosis=ai_analysis.get('diagnosis', cleaned_text[:500]),
            prescription=ai_analysis.get('prescription', 'See uploaded report'),
            doctor_name=request.data.get('doctor_name', 'AI Analysis'),
            visit_date=datetime.now().date(),
            notes=f"AI Risk Level: {ai_analysis.get('risk_level', 'Unknown')}\n\nFull Report Analysis:\n{ai_analysis.get('summary', '')}"
        )
        
        # Clean up temporary file
        default_storage.delete(file_path)
        
        return Response({
            'success': True,
            'message': 'Medical report analyzed successfully',
            'record_id': medical_record.id,
            'ai_analysis': ai_analysis,
            'extracted_text_preview': cleaned_text[:200] + '...'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Clean up on error
        if default_storage.exists(file_path):
            default_storage.delete(file_path)
        
        return Response({
            'error': f'Error processing report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def extract_text_from_pdf(file_path):
    """Enhanced PDF text extraction with multiple fallback methods"""
    
    extracted_text = None
    
    # Method 1: Try pdfplumber first (best for complex layouts)
    if pdfplumber:
        try:
            with pdfplumber.open(file_path) as pdf:
                text_parts = []
                for page_num, page in enumerate(pdf.pages):
                    # Try different extraction strategies
                    page_text = page.extract_text()
                    if not page_text:  # If normal extraction fails, try with layout
                        page_text = page.extract_text(layout=True)
                    if not page_text:  # If still fails, try extracting from tables
                        tables = page.extract_tables()
                        if tables:
                            for table in tables:
                                for row in table:
                                    if row:
                                        page_text += ' '.join([cell or '' for cell in row]) + ' '
                    
                    if page_text:
                        text_parts.append(f"Page {page_num + 1}: {page_text}")
                
                if text_parts:
                    extracted_text = '\n'.join(text_parts)
                    print(f"pdfplumber extracted {len(extracted_text)} characters")
        except Exception as e:
            print(f"pdfplumber error: {e}")
    
    # Method 2: Fallback to PyPDF2 if pdfplumber fails
    if not extracted_text and PyPDF2:
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_parts = []
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(f"Page {page_num + 1}: {page_text}")
                
                if text_parts:
                    extracted_text = '\n'.join(text_parts)
                    print(f"PyPDF2 extracted {len(extracted_text)} characters")
        except Exception as e:
            print(f"PyPDF2 error: {e}")
    
    # Method 3: Try alternative PyPDF2 approach
    if not extracted_text and PyPDF2:
        try:
            import PyPDF2.pdf as pdf_module
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text_parts = []
                for page in reader.pages:
                    try:
                        text = page.extract_text()
                        if text:
                            text_parts.append(text)
                    except:
                        continue
                
                if text_parts:
                    extracted_text = ' '.join(text_parts)
                    print(f"Alternative PyPDF2 extracted {len(extracted_text)} characters")
        except Exception as e:
            print(f"Alternative PyPDF2 error: {e}")
    
    return extracted_text


def clean_medical_text(text):
    """Enhanced cleaning and normalization of extracted medical text"""
    
    if not text:
        return ""
    
    # Remove excessive whitespace and normalize
    text = re.sub(r'\s+', ' ', text)
    
    # Fix common PDF extraction issues
    text = text.replace('\x0c', ' ')  # Form feed
    text = text.replace('\xa0', ' ')  # Non-breaking space
    
    # Remove special characters but preserve medical punctuation
    text = re.sub(r'[^\w\s\-\.\,\:\;\(\)\/\%\+\=]', '', text)
    
    # Normalize medical terms spacing
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
    
    # Clean up multiple punctuation
    text = re.sub(r'[\.,]{2,}', '.', text)
    text = re.sub(r'[:;]{2,}', ':', text)
    
    # Remove extra line breaks and normalize
    text = text.replace('\n\n', '\n').strip()
    
    return text


def analyze_with_ai(text):
    """
    Analyze medical text with AI model
    Supports: OpenAI GPT, Google Gemini, or local LLM
    """
    
    # Option 1: OpenAI GPT (if API key available)
    if openai and os.getenv('OPENAI_API_KEY'):
        return analyze_with_openai(text)
    
    # Option 2: Google Gemini (if API key available)
    elif os.getenv('GEMINI_API_KEY'):
        return analyze_with_gemini(text)
    
    # Option 3: Rule-based fallback (no API key needed)
    else:
        return analyze_with_rules(text)


def analyze_with_openai(text):
    """Analyze with OpenAI GPT"""
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        prompt = f"""
You are a medical expert analyzing a medical report. Extract the following information and return ONLY a valid JSON object:

Medical Report Text:
{text[:3000]}

Extract and return JSON with these exact keys:
{{
    "disease": "primary disease or condition (single disease name)",
    "symptoms": "comma-separated list of symptoms found",
    "diagnosis": "brief diagnosis summary",
    "prescription": "treatment recommendations or medications",
    "risk_level": "LOW, MEDIUM, HIGH, or CRITICAL",
    "summary": "brief summary of the medical condition"
}}

Rules:
- Return ONLY the JSON object, no other text
- Use simple disease names (e.g., "Diabetes", "Hypertension", "Dengue")
- Keep all values concise but informative
- If information is not found, use "Not specified" for that field
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical report analyzer. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        import json
        result_text = response.choices[0].message.content.strip()
        
        # Clean the response to ensure it's valid JSON
        if result_text.startswith('```json'):
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        result = json.loads(result_text)
        result['analysis_method'] = 'OpenAI GPT-3.5'
        return result
        
    except Exception as e:
        print(f"OpenAI error: {e}")
        return analyze_with_rules(text)


def analyze_with_gemini(text):
    """Analyze with Google Gemini"""
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Analyze this medical report and extract:
        - Disease/Condition
        - Symptoms
        - Diagnosis
        - Prescription/Treatment
        - Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
        - Summary
        
        Medical Report:
        {text[:2000]}
        
        Provide response in JSON format.
        """
        
        response = model.generate_content(prompt)
        
        import json
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        print(f"Gemini error: {e}")
        return analyze_with_rules(text)


def analyze_with_rules(text):
    """
    Enhanced rule-based analysis with better pattern recognition
    Uses keyword matching and pattern recognition
    """
    
    text_lower = text.lower()
    original_text = text  # Keep original for better extraction
    
    # Enhanced disease detection with more keywords
    disease_keywords = {
        'Dengue': ['dengue', 'ns1', 'platelet', 'hemorrhagic fever', 'aedes', 'mosquito borne'],
        'Malaria': ['malaria', 'plasmodium', 'parasite', 'falciparum', 'vivax', 'anopheles'],
        'Typhoid': ['typhoid', 'salmonella', 'enteric fever', 'widal', 'rose spots'],
        'COVID-19': ['covid', 'coronavirus', 'sars-cov-2', 'rt-pcr', 'covid-19', 'corona virus'],
        'Tuberculosis': ['tuberculosis', 'tb', 'mycobacterium', 'chest x-ray', 'sputum', 'mantoux'],
        'Diabetes': ['diabetes', 'glucose', 'insulin', 'hba1c', 'blood sugar', 'diabetic'],
        'Hypertension': ['hypertension', 'blood pressure', 'bp', 'systolic', 'diastolic', 'high bp'],
        'Pneumonia': ['pneumonia', 'lung infection', 'respiratory', 'chest infection', 'bronchitis'],
        'Influenza': ['influenza', 'flu', 'h1n1', 'viral fever', 'seasonal flu'],
        'Cholera': ['cholera', 'vibrio', 'severe diarrhea', 'dehydration', 'rice water stool'],
        'Asthma': ['asthma', 'bronchial', 'wheezing', 'inhaler', 'respiratory distress'],
        'Heart Disease': ['heart', 'cardiac', 'coronary', 'myocardial', 'angina', 'ecg'],
        'Kidney Disease': ['kidney', 'renal', 'nephritis', 'creatinine', 'urea', 'dialysis']
    }
    
    detected_disease = 'Unknown'
    disease_confidence = 0
    
    for disease, keywords in disease_keywords.items():
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        if matches > disease_confidence:
            disease_confidence = matches
            detected_disease = disease
    
    # Enhanced symptom extraction
    symptom_keywords = [
        'fever', 'high fever', 'cough', 'dry cough', 'headache', 'severe headache',
        'pain', 'chest pain', 'abdominal pain', 'body pain', 'joint pain',
        'fatigue', 'weakness', 'tiredness', 'nausea', 'vomiting', 'diarrhea',
        'rash', 'skin rash', 'breathing difficulty', 'shortness of breath',
        'sore throat', 'loss of appetite', 'weight loss', 'night sweats',
        'chills', 'shivering', 'dizziness', 'confusion', 'loss of consciousness'
    ]
    
    detected_symptoms = []
    for symptom in symptom_keywords:
        if symptom in text_lower:
            detected_symptoms.append(symptom)
    
    symptoms_text = ', '.join(detected_symptoms[:8]) if detected_symptoms else 'Symptoms not clearly specified'
    
    # Enhanced risk level assessment
    risk_keywords = {
        'CRITICAL': ['critical', 'severe', 'emergency', 'icu', 'intensive care', 'life threatening', 'urgent'],
        'HIGH': ['high risk', 'serious', 'immediate attention', 'hospitalization', 'complications'],
        'MEDIUM': ['moderate', 'monitor', 'follow-up required', 'observation', 'stable condition'],
        'LOW': ['mild', 'stable', 'normal', 'no complications', 'routine', 'minor']
    }
    
    risk_level = 'MEDIUM'  # Default
    for level, keywords in risk_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            risk_level = level
            break
    
    # Better diagnosis extraction using multiple patterns
    diagnosis_patterns = [
        r'diagnosis[:\s]+(.*?)(?:prescription|treatment|recommendation|notes|$)',
        r'impression[:\s]+(.*?)(?:prescription|treatment|recommendation|notes|$)',
        r'clinical diagnosis[:\s]+(.*?)(?:prescription|treatment|recommendation|notes|$)',
        r'final diagnosis[:\s]+(.*?)(?:prescription|treatment|recommendation|notes|$)'
    ]
    
    diagnosis = 'Not clearly specified'
    for pattern in diagnosis_patterns:
        match = re.search(pattern, text_lower, re.DOTALL)
        if match:
            diagnosis = match.group(1).strip()[:300]
            diagnosis = re.sub(r'\s+', ' ', diagnosis)  # Clean whitespace
            break
    
    # Better prescription extraction
    prescription_patterns = [
        r'(?:prescription|treatment|medication|drugs?)[:\s]+(.*?)(?:notes|follow|advice|$)',
        r'(?:recommended|advised|prescribed)[:\s]+(.*?)(?:notes|follow|advice|$)',
        r'(?:rx|treatment plan)[:\s]+(.*?)(?:notes|follow|advice|$)'
    ]
    
    prescription = 'Treatment plan not clearly specified'
    for pattern in prescription_patterns:
        match = re.search(pattern, text_lower, re.DOTALL)
        if match:
            prescription = match.group(1).strip()[:300]
            prescription = re.sub(r'\s+', ' ', prescription)  # Clean whitespace
            break
    
    # Generate better summary
    summary = f'Medical report analysis detected {detected_disease}'
    if detected_symptoms:
        summary += f' with symptoms including {symptoms_text[:100]}'
    summary += f'. Risk level assessed as {risk_level}.'
    
    return {
        'disease': detected_disease,
        'symptoms': symptoms_text,
        'diagnosis': diagnosis,
        'prescription': prescription,
        'risk_level': risk_level,
        'summary': summary,
        'analysis_method': 'Enhanced Rule-based Analysis',
        'confidence': f'{disease_confidence} keyword matches' if disease_confidence > 0 else 'Low confidence'
    }


@api_view(['GET'])
def get_patient_reports(request):
    """Get all medical records for a patient including AI-analyzed reports"""
    
    patient_id = request.query_params.get('patient_id')
    
    if not patient_id:
        return Response({'error': 'patient_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        patient = Patient.objects.get(patient_id=patient_id)
        records = MedicalRecord.objects.filter(patient=patient).order_by('-visit_date')
        
        records_data = []
        for record in records:
            records_data.append({
                'id': record.id,
                'disease': record.disease,
                'symptoms': record.symptoms,
                'diagnosis': record.diagnosis,
                'prescription': record.prescription,
                'doctor_name': record.doctor_name,
                'visit_date': record.visit_date,
                'notes': record.notes,
                'created_at': record.created_at,
                'is_ai_analyzed': 'AI Risk Level' in (record.notes or '')
            })
        
        return Response({
            'patient_id': patient.patient_id,
            'patient_name': patient.name,
            'total_records': len(records_data),
            'records': records_data
        })
        
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
