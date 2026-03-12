from rest_framework.decorators import api_view
from rest_framework.response import Response
from .report_upload_views import extract_text_from_pdf, clean_medical_text, analyze_with_ai
import os

@api_view(['POST'])
def debug_pdf_analysis(request):
    """Debug endpoint to test PDF analysis without saving to database"""
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'})
    
    uploaded_file = request.FILES['file']
    
    if not uploaded_file.name.endswith('.pdf'):
        return Response({'error': 'Only PDF files supported'})
    
    # Save temporarily
    from django.core.files.storage import default_storage
    file_path = default_storage.save(f'temp_reports/debug_{uploaded_file.name}', uploaded_file)
    full_path = os.path.join(default_storage.location, file_path)
    
    try:
        # Step 1: Extract text
        extracted_text = extract_text_from_pdf(full_path)
        
        if not extracted_text:
            return Response({
                'error': 'Could not extract text from PDF',
                'step': 'text_extraction'
            })
        
        # Step 2: Clean text
        cleaned_text = clean_medical_text(extracted_text)
        
        # Step 3: Analyze with AI
        ai_analysis = analyze_with_ai(cleaned_text)
        
        # Clean up
        default_storage.delete(file_path)
        
        return Response({
            'success': True,
            'debug_info': {
                'original_text_length': len(extracted_text),
                'cleaned_text_length': len(cleaned_text),
                'extraction_preview': extracted_text[:500] + '...' if len(extracted_text) > 500 else extracted_text,
                'cleaned_preview': cleaned_text[:500] + '...' if len(cleaned_text) > 500 else cleaned_text
            },
            'ai_analysis': ai_analysis
        })
        
    except Exception as e:
        # Clean up on error
        if default_storage.exists(file_path):
            default_storage.delete(file_path)
        
        return Response({
            'error': f'Debug analysis failed: {str(e)}',
            'step': 'ai_analysis'
        })

@api_view(['POST'])
def test_text_analysis(request):
    """Test AI analysis with provided text (no PDF needed)"""
    
    text = request.data.get('text', '')
    
    if not text:
        return Response({'error': 'No text provided'})
    
    try:
        # Clean the text
        cleaned_text = clean_medical_text(text)
        
        # Analyze with AI
        ai_analysis = analyze_with_ai(cleaned_text)
        
        return Response({
            'success': True,
            'input_text': text,
            'cleaned_text': cleaned_text,
            'ai_analysis': ai_analysis
        })
        
    except Exception as e:
        return Response({
            'error': f'Text analysis failed: {str(e)}'
        })

@api_view(['GET'])
def test_ai_connection(request):
    """Test AI API connections"""
    
    results = {}
    
    # Test OpenAI
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key and openai_key != 'your-openai-api-key-here':
        results['openai'] = {
            'configured': True,
            'key_preview': f"{openai_key[:10]}...{openai_key[-4:]}" if len(openai_key) > 14 else 'Key too short'
        }
        
        # Test actual connection
        try:
            from .report_upload_views import analyze_with_openai
            test_result = analyze_with_openai("Patient has fever and cough. Diagnosis: Common cold. Treatment: Rest and fluids.")
            results['openai']['connection_test'] = 'SUCCESS'
            results['openai']['sample_response'] = test_result
        except Exception as e:
            results['openai']['connection_test'] = f'FAILED: {str(e)}'
    else:
        results['openai'] = {
            'configured': False,
            'message': 'No OpenAI API key configured'
        }
    
    # Test Gemini
    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key and gemini_key != 'your-gemini-api-key-here':
        results['gemini'] = {
            'configured': True,
            'key_preview': f"{gemini_key[:10]}...{gemini_key[-4:]}" if len(gemini_key) > 14 else 'Key too short'
        }
    else:
        results['gemini'] = {
            'configured': False,
            'message': 'No Gemini API key configured'
        }
    
    # Test rule-based analysis
    try:
        from .report_upload_views import analyze_with_rules
        rule_result = analyze_with_rules("Patient has fever and cough. Diagnosis: Common cold. Treatment: Rest and fluids.")
        results['rule_based'] = {
            'available': True,
            'sample_response': rule_result
        }
    except Exception as e:
        results['rule_based'] = {
            'available': False,
            'error': str(e)
        }
    
    return Response({
        'ai_connections': results,
        'recommendation': get_ai_recommendation(results)
    })

def get_ai_recommendation(results):
    """Get recommendation based on AI connection status"""
    
    if results.get('openai', {}).get('configured'):
        return "OpenAI is configured and should provide the best analysis results."
    elif results.get('gemini', {}).get('configured'):
        return "Gemini is configured and will provide good analysis results."
    elif results.get('rule_based', {}).get('available'):
        return "Only rule-based analysis is available. Consider adding an AI API key for better results."
    else:
        return "No analysis methods available. Check your configuration."