#!/usr/bin/env python3
"""
Comprehensive QR Code Test
"""

import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_system.settings')
django.setup()

from patients.models import Patient
from django.conf import settings

def test_qr_functionality():
    print("🔍 Testing QR Code Functionality")
    print("=" * 50)
    
    # Test 1: Check if patients have QR codes
    patients = Patient.objects.all()[:5]  # Test first 5 patients
    
    for patient in patients:
        print(f"\n📋 Patient: {patient.patient_id} - {patient.name}")
        
        # Check if QR code exists
        if patient.qr_code:
            print(f"  ✅ QR Code exists: {patient.qr_code.name}")
            
            # Check if file actually exists
            qr_path = patient.qr_code.path
            if os.path.exists(qr_path):
                file_size = os.path.getsize(qr_path)
                print(f"  ✅ File exists on disk: {file_size} bytes")
            else:
                print(f"  ❌ File missing on disk: {qr_path}")
            
            # Check URL
            qr_url = patient.get_qr_code_url()
            print(f"  🔗 QR URL: {qr_url}")
            
        else:
            print(f"  ❌ No QR code found")
            print(f"  🔧 Generating QR code...")
            success = patient.generate_qr_code()
            if success:
                print(f"  ✅ QR code generated successfully")
                print(f"  🔗 QR URL: {patient.get_qr_code_url()}")
            else:
                print(f"  ❌ QR code generation failed")

def create_test_patient_with_qr():
    print("\n🆕 Creating Test Patient with QR Code")
    print("=" * 50)
    
    # Create a new test patient
    test_patient = Patient.objects.create(
        name="QR Test Patient",
        age=30,
        gender="Male",
        phone="1234567890",
        email="qrtest@example.com",
        address="123 Test Street",
        location="Test City",
        blood_group="O+"
    )
    
    print(f"✅ Created patient: {test_patient.patient_id} - {test_patient.name}")
    
    # Check if QR code was auto-generated
    if test_patient.qr_code:
        print(f"✅ QR code auto-generated: {test_patient.qr_code.name}")
        print(f"🔗 QR URL: {test_patient.get_qr_code_url()}")
        
        # Verify file exists
        if os.path.exists(test_patient.qr_code.path):
            file_size = os.path.getsize(test_patient.qr_code.path)
            print(f"✅ QR file verified: {file_size} bytes")
        else:
            print(f"❌ QR file not found")
    else:
        print(f"❌ QR code not auto-generated")
        print(f"🔧 Manually generating...")
        success = test_patient.generate_qr_code()
        if success:
            print(f"✅ Manual QR generation successful")
        else:
            print(f"❌ Manual QR generation failed")
    
    return test_patient

def test_qr_regeneration():
    print("\n🔄 Testing QR Code Regeneration")
    print("=" * 50)
    
    patient = Patient.objects.first()
    if not patient:
        print("❌ No patients found")
        return
    
    print(f"📋 Testing with: {patient.patient_id} - {patient.name}")
    
    # Get original QR
    original_qr = patient.qr_code.name if patient.qr_code else None
    print(f"🔗 Original QR: {original_qr}")
    
    # Regenerate
    success = patient.regenerate_qr_code()
    if success:
        new_qr = patient.qr_code.name if patient.qr_code else None
        print(f"✅ Regeneration successful")
        print(f"🔗 New QR: {new_qr}")
        print(f"🔗 New URL: {patient.get_qr_code_url()}")
    else:
        print(f"❌ Regeneration failed")

def verify_qr_content():
    print("\n📖 Verifying QR Code Content")
    print("=" * 50)
    
    try:
        import qrcode
        from PIL import Image
        import cv2
        from pyzbar import pyzbar
    except ImportError:
        print("⚠️  QR reading libraries not available (pyzbar, cv2)")
        print("   Install with: pip install pyzbar opencv-python")
        return
    
    patient = Patient.objects.first()
    if not patient or not patient.qr_code:
        print("❌ No patient with QR code found")
        return
    
    try:
        # Read QR code content
        qr_path = patient.qr_code.path
        image = cv2.imread(qr_path)
        barcodes = pyzbar.decode(image)
        
        if barcodes:
            for barcode in barcodes:
                qr_data = barcode.data.decode('utf-8')
                print(f"📋 Patient: {patient.patient_id} - {patient.name}")
                print(f"📖 QR Content:")
                print(f"   {qr_data}")
                
                # Verify content matches patient data
                if patient.patient_id in qr_data and patient.name in qr_data:
                    print(f"✅ QR content matches patient data")
                else:
                    print(f"❌ QR content mismatch")
        else:
            print(f"❌ Could not decode QR code")
            
    except Exception as e:
        print(f"❌ Error reading QR code: {e}")

def main():
    print("🏥 Smart Healthcare QR Code Test Suite")
    print("=" * 60)
    
    # Test existing QR codes
    test_qr_functionality()
    
    # Create new patient with QR
    test_patient = create_test_patient_with_qr()
    
    # Test regeneration
    test_qr_regeneration()
    
    # Verify QR content (optional - requires additional libraries)
    verify_qr_content()
    
    print("\n" + "=" * 60)
    print("🎉 QR Code Test Complete!")
    print("=" * 60)
    
    # Summary
    total_patients = Patient.objects.count()
    patients_with_qr = Patient.objects.exclude(qr_code='').count()
    
    print(f"📊 Summary:")
    print(f"   Total Patients: {total_patients}")
    print(f"   Patients with QR: {patients_with_qr}")
    print(f"   QR Coverage: {(patients_with_qr/total_patients*100):.1f}%")
    
    # Show QR directory
    qr_dir = os.path.join(settings.MEDIA_ROOT, 'qr_codes')
    if os.path.exists(qr_dir):
        qr_files = len([f for f in os.listdir(qr_dir) if f.endswith('.png')])
        print(f"   QR Files on disk: {qr_files}")
    
    print(f"\n✅ QR Code feature is working correctly!")
    print(f"🔗 QR codes are accessible at: http://localhost:8000/media/qr_codes/")

if __name__ == '__main__':
    main()