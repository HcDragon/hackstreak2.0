#!/usr/bin/env python3
"""
Test QR Code Generation
"""

import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_system.settings')
django.setup()

from patients.models import Patient
import qrcode
from io import BytesIO
from django.core.files import File
from django.conf import settings

def test_qr_generation():
    print("Testing QR Code Generation...")
    
    # Test basic QR code creation
    try:
        qr_data = "Test QR Code Data"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        print("✓ QR code image created successfully")
        
        # Test saving to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        print(f"✓ QR code saved to buffer, size: {len(buffer.getvalue())} bytes")
        buffer.close()
        
    except Exception as e:
        print(f"✗ QR code generation failed: {e}")
        return False
    
    # Test with actual patient
    try:
        patient = Patient.objects.first()
        if patient:
            print(f"\nTesting with patient: {patient.patient_id} - {patient.name}")
            
            # Generate QR code manually
            qr_data = f"Patient ID: {patient.patient_id}\\nName: {patient.name}\\nAge: {patient.age}\\nLocation: {patient.location}"
            print(f"QR Data: {qr_data}")
            
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save to media directory
            media_path = os.path.join(settings.MEDIA_ROOT, 'qr_codes')
            os.makedirs(media_path, exist_ok=True)
            
            file_path = os.path.join(media_path, f'test_qr_{patient.patient_id}.png')
            img.save(file_path)
            print(f"✓ QR code saved to: {file_path}")
            
            # Check if file exists
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"✓ File exists, size: {file_size} bytes")
            else:
                print("✗ File was not created")
                
        else:
            print("No patients found in database")
            
    except Exception as e:
        print(f"✗ Patient QR generation failed: {e}")
        import traceback
        traceback.print_exc()

def regenerate_patient_qr_codes():
    print("\nRegenerating QR codes for all patients...")
    
    patients = Patient.objects.all()
    success_count = 0
    
    for patient in patients:
        try:
            # Clear existing QR code
            if patient.qr_code:
                patient.qr_code.delete(save=False)
            
            # Generate new QR code
            qr_data = f"Patient ID: {patient.patient_id}\\nName: {patient.name}\\nAge: {patient.age}\\nLocation: {patient.location}"
            
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            file_name = f'qr_{patient.patient_id}.png'
            patient.qr_code.save(file_name, File(buffer), save=False)
            buffer.close()
            
            patient.save(update_fields=['qr_code'])
            
            print(f"✓ Generated QR for {patient.patient_id} - {patient.name}")
            success_count += 1
            
        except Exception as e:
            print(f"✗ Failed to generate QR for {patient.patient_id}: {e}")
    
    print(f"\nCompleted: {success_count}/{len(patients)} QR codes generated")

if __name__ == '__main__':
    test_qr_generation()
    regenerate_patient_qr_codes()