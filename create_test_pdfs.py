#!/usr/bin/env python3
"""
Generate sample medical report PDFs for testing the AI analysis system
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

def create_sample_medical_reports():
    """Create sample medical report PDFs for testing"""
    
    # Sample medical reports data
    reports = [
        {
            'filename': 'dengue_report.pdf',
            'content': {
                'patient_name': 'John Doe',
                'age': '35',
                'date': '2024-03-12',
                'chief_complaint': 'High fever, severe headache, body pain',
                'symptoms': 'Fever (102°F), Headache, Body ache, Rash on arms, Loss of appetite, Joint pain',
                'diagnosis': 'Dengue fever confirmed through NS1 antigen test. Platelet count: 80,000 (low)',
                'prescription': '1. Paracetamol 500mg - 3 times daily\n2. Plenty of fluids (3-4 liters/day)\n3. Complete bed rest\n4. Monitor platelet count daily',
                'risk_level': 'HIGH',
                'notes': 'Requires close monitoring for next 5-7 days. Watch for bleeding signs.',
                'doctor': 'Dr. Smith, MD'
            }
        },
        {
            'filename': 'diabetes_report.pdf',
            'content': {
                'patient_name': 'Jane Smith',
                'age': '45',
                'date': '2024-03-12',
                'chief_complaint': 'Frequent urination, excessive thirst, fatigue',
                'symptoms': 'Polyuria, Polydipsia, Fatigue, Weight loss, Blurred vision',
                'diagnosis': 'Type 2 Diabetes Mellitus. HbA1c: 9.2% (elevated), Fasting glucose: 180 mg/dl',
                'prescription': '1. Metformin 500mg twice daily\n2. Dietary modifications\n3. Regular exercise\n4. Blood glucose monitoring',
                'risk_level': 'MEDIUM',
                'notes': 'Patient counseled on lifestyle modifications. Follow-up in 3 months.',
                'doctor': 'Dr. Johnson, MD'
            }
        },
        {
            'filename': 'pneumonia_report.pdf',
            'content': {
                'patient_name': 'Robert Wilson',
                'age': '65',
                'date': '2024-03-12',
                'chief_complaint': 'Persistent cough, chest pain, difficulty breathing',
                'symptoms': 'Productive cough, Chest pain, Shortness of breath, Fever, Chills, Fatigue',
                'diagnosis': 'Bacterial pneumonia confirmed via chest X-ray. Right lower lobe consolidation.',
                'prescription': '1. Amoxicillin 875mg twice daily for 7 days\n2. Rest and adequate fluids\n3. Oxygen therapy if needed\n4. Follow-up chest X-ray',
                'risk_level': 'HIGH',
                'notes': 'Patient requires hospitalization. Monitor oxygen saturation closely.',
                'doctor': 'Dr. Brown, MD'
            }
        },
        {
            'filename': 'hypertension_report.pdf',
            'content': {
                'patient_name': 'Mary Johnson',
                'age': '50',
                'date': '2024-03-12',
                'chief_complaint': 'Headache, dizziness, routine check-up',
                'symptoms': 'Mild headache, Occasional dizziness, No chest pain',
                'diagnosis': 'Essential hypertension. Blood pressure: 160/95 mmHg (elevated)',
                'prescription': '1. Lisinopril 10mg once daily\n2. Low sodium diet\n3. Regular exercise\n4. Weight management',
                'risk_level': 'MEDIUM',
                'notes': 'Patient advised on lifestyle modifications. Monitor BP weekly.',
                'doctor': 'Dr. Davis, MD'
            }
        },
        {
            'filename': 'covid_report.pdf',
            'content': {
                'patient_name': 'Michael Brown',
                'age': '28',
                'date': '2024-03-12',
                'chief_complaint': 'Fever, dry cough, loss of taste and smell',
                'symptoms': 'Fever, Dry cough, Loss of taste, Loss of smell, Fatigue, Body aches',
                'diagnosis': 'COVID-19 positive via RT-PCR test. Mild to moderate symptoms.',
                'prescription': '1. Home isolation for 10 days\n2. Symptomatic treatment\n3. Paracetamol for fever\n4. Adequate rest and fluids',
                'risk_level': 'MEDIUM',
                'notes': 'Patient advised to monitor symptoms. Seek medical attention if breathing difficulty.',
                'doctor': 'Dr. Wilson, MD'
            }
        }
    ]
    
    # Create reports directory
    reports_dir = 'sample_medical_reports'
    os.makedirs(reports_dir, exist_ok=True)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    for report in reports:
        # Create PDF
        filename = os.path.join(reports_dir, report['filename'])
        doc = SimpleDocTemplate(filename, pagesize=letter)
        story = []
        
        content = report['content']
        
        # Title
        story.append(Paragraph("MEDICAL REPORT", title_style))
        story.append(Spacer(1, 20))
        
        # Patient Information
        story.append(Paragraph(f"<b>Patient Name:</b> {content['patient_name']}", styles['Normal']))
        story.append(Paragraph(f"<b>Age:</b> {content['age']} years", styles['Normal']))
        story.append(Paragraph(f"<b>Date:</b> {content['date']}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Chief Complaint
        story.append(Paragraph("<b>CHIEF COMPLAINT:</b>", styles['Heading2']))
        story.append(Paragraph(content['chief_complaint'], styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Symptoms
        story.append(Paragraph("<b>SYMPTOMS:</b>", styles['Heading2']))
        story.append(Paragraph(content['symptoms'], styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Diagnosis
        story.append(Paragraph("<b>DIAGNOSIS:</b>", styles['Heading2']))
        story.append(Paragraph(content['diagnosis'], styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Prescription
        story.append(Paragraph("<b>PRESCRIPTION/TREATMENT:</b>", styles['Heading2']))
        prescription_lines = content['prescription'].split('\\n')
        for line in prescription_lines:
            story.append(Paragraph(line, styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Risk Level
        story.append(Paragraph(f"<b>RISK LEVEL:</b> {content['risk_level']}", styles['Heading2']))
        story.append(Spacer(1, 10))
        
        # Notes
        story.append(Paragraph("<b>NOTES:</b>", styles['Heading2']))
        story.append(Paragraph(content['notes'], styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Doctor signature
        story.append(Paragraph(f"<b>Doctor:</b> {content['doctor']}", styles['Normal']))
        story.append(Paragraph("License: MD12345", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        print(f"✓ Created: {filename}")
    
    print(f"\\n✅ Created {len(reports)} sample medical reports in '{reports_dir}' directory")
    print("\\nYou can now test the AI analysis by uploading these PDFs!")

if __name__ == '__main__':
    try:
        from reportlab.lib.pagesizes import letter
        create_sample_medical_reports()
    except ImportError:
        print("❌ ReportLab not installed. Installing...")
        import subprocess
        subprocess.check_call(['pip3', 'install', 'reportlab'])
        print("✅ ReportLab installed. Running again...")
        create_sample_medical_reports()