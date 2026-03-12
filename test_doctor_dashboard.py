#!/usr/bin/env python3
"""
Doctor Dashboard Test Script
Verifies that all components are properly set up for the doctor dashboard.
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/Users/aravmalviya/Desktop/hackstreek backend ')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_system.settings')

django.setup()

from django.contrib.auth.models import User
from patients.doctor_models import Doctor, Medicine
from patients.models import Patient, MedicalRecord

def test_doctor_dashboard_setup():
    """Test that all components are properly set up"""
    
    print("🧪 Testing Doctor Dashboard Setup...")
    print("=" * 60)
    
    # Test 1: Check if doctor user exists
    try:
        doctor_user = User.objects.get(username='doctor1')
        doctor = Doctor.objects.get(user=doctor_user)
        print(f"✅ Doctor user found: {doctor_user.username}")
        print(f"✅ Doctor profile found: {doctor.doctor_id} - Dr. {doctor_user.first_name} {doctor_user.last_name}")
        print(f"   Specialization: {doctor.specialization}")
        print(f"   Hospital: {doctor.hospital}")
    except (User.DoesNotExist, Doctor.DoesNotExist):
        print("❌ Doctor user or profile not found!")
        return False
    
    # Test 2: Check medicines
    medicine_count = Medicine.objects.count()
    print(f"✅ Medicines in database: {medicine_count}")
    if medicine_count > 0:
        sample_medicines = Medicine.objects.all()[:3]
        for med in sample_medicines:
            print(f"   - {med.name} ({med.strength}) - {med.category}")
    
    # Test 3: Check existing patients (if any)
    patient_count = Patient.objects.count()
    print(f"✅ Patients in database: {patient_count}")
    
    # Test 4: Check medical records (if any)
    record_count = MedicalRecord.objects.count()
    print(f"✅ Medical records in database: {record_count}")
    
    print("\n" + "=" * 60)
    print("🎉 Doctor Dashboard Setup Complete!")
    
    return True

def print_instructions():
    """Print instructions for running the doctor dashboard"""
    
    print("\n📋 DOCTOR DASHBOARD INSTRUCTIONS")
    print("=" * 60)
    
    print("\n1️⃣ START THE BACKEND SERVER:")
    print("   cd '/Users/aravmalviya/Desktop/hackstreek backend '")
    print("   python3 manage.py runserver")
    print("   ➡️  Backend will run at: http://localhost:8000")
    
    print("\n2️⃣ START THE FRONTEND SERVER:")
    print("   cd '/Users/aravmalviya/Desktop/hackstreek frontend'")
    print("   python3 -m http.server 8080")
    print("   ➡️  Frontend will run at: http://localhost:8080")
    
    print("\n3️⃣ ACCESS THE DOCTOR DASHBOARD:")
    print("   Open browser and go to: http://localhost:8080/doctor-dashboard.html")
    
    print("\n4️⃣ LOGIN CREDENTIALS:")
    print("   Username: doctor1")
    print("   Password: doctor123")
    
    print("\n5️⃣ FEATURES AVAILABLE:")
    print("   ✅ Doctor authentication (login/logout)")
    print("   ✅ Dashboard statistics")
    print("   ✅ Patient management")
    print("   ✅ Medical records CRUD")
    print("   ✅ Medicine database")
    print("   ✅ Prescription management")
    print("   ✅ Responsive design")
    
    print("\n6️⃣ API ENDPOINTS AVAILABLE:")
    print("   POST /api/doctor/login/ - Doctor login")
    print("   POST /api/doctor/logout/ - Doctor logout")
    print("   GET  /api/doctor/dashboard/ - Dashboard stats")
    print("   GET  /api/doctor/patients/ - List patients")
    print("   GET  /api/doctor/medical-records/ - List records")
    print("   POST /api/doctor/medical-records/ - Create record")
    print("   GET  /api/doctor/medicines/ - List medicines")
    print("   POST /api/doctor/medicines/ - Create medicine")
    print("   GET  /api/doctor/prescriptions/ - List prescriptions")
    print("   POST /api/doctor/prescriptions/ - Create prescription")
    
    print("\n💡 TESTING TIPS:")
    print("   - First register some patients using the main interface")
    print("   - Then login to doctor dashboard to manage them")
    print("   - Add medical records and prescriptions")
    print("   - Test all CRUD operations")
    
    print("\n🔧 TROUBLESHOOTING:")
    print("   - Ensure both servers are running")
    print("   - Check browser console for errors")
    print("   - Verify CORS settings in Django")
    print("   - Test API endpoints with Postman if needed")

def main():
    """Main function"""
    
    # Test setup
    setup_ok = test_doctor_dashboard_setup()
    
    if setup_ok:
        # Print instructions
        print_instructions()
        
        print("\n" + "=" * 60)
        print("🚀 Ready to test the Doctor Dashboard!")
        print("   Follow the instructions above to start the servers.")
        print("=" * 60)
    else:
        print("\n❌ Setup incomplete. Please run create_doctor_data.py first.")

if __name__ == "__main__":
    main()