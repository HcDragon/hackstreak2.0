#!/usr/bin/env python3
"""
Sample Doctor Data Population Script
Creates a sample doctor user and some medicines for testing the doctor dashboard.
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

def create_sample_doctor():
    """Create a sample doctor user for testing"""
    
    # Create Django user
    username = "doctor1"
    password = "doctor123"
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"Doctor user '{username}' already exists!")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create_user(
            username=username,
            password=password,
            email="doctor1@hospital.com",
            first_name="John",
            last_name="Smith"
        )
        print(f"Created Django user: {username}")
    
    # Create Doctor profile
    if Doctor.objects.filter(user=user).exists():
        print("Doctor profile already exists!")
        doctor = Doctor.objects.get(user=user)
    else:
        doctor = Doctor.objects.create(
            user=user,
            specialization="General Medicine",
            phone="9876543210",
            license_number="MED12345",
            hospital="City General Hospital",
            experience_years=10,
            is_verified=True
        )
        print(f"Created Doctor profile: Dr. {user.first_name} {user.last_name}")
    
    return doctor

def create_sample_medicines():
    """Create sample medicines for testing"""
    
    medicines_data = [
        {
            "name": "Paracetamol",
            "generic_name": "Acetaminophen",
            "category": "Analgesic",
            "dosage_form": "Tablet",
            "strength": "500mg",
            "manufacturer": "PharmaCorp",
            "description": "Pain reliever and fever reducer",
            "price": 25.50,
            "is_prescription_required": False
        },
        {
            "name": "Amoxicillin",
            "generic_name": "Amoxicillin",
            "category": "Antibiotic",
            "dosage_form": "Capsule",
            "strength": "250mg",
            "manufacturer": "MediLab",
            "description": "Broad-spectrum antibiotic",
            "price": 120.00,
            "is_prescription_required": True
        },
        {
            "name": "Ibuprofen",
            "generic_name": "Ibuprofen",
            "category": "NSAID",
            "dosage_form": "Tablet",
            "strength": "400mg",
            "manufacturer": "HealthPlus",
            "description": "Anti-inflammatory pain reliever",
            "price": 45.75,
            "is_prescription_required": False
        },
        {
            "name": "Cetirizine",
            "generic_name": "Cetirizine HCl",
            "category": "Antihistamine",
            "dosage_form": "Tablet",
            "strength": "10mg",
            "manufacturer": "AllergyFree",
            "description": "Allergy relief medication",
            "price": 35.00,
            "is_prescription_required": False
        },
        {
            "name": "Omeprazole",
            "generic_name": "Omeprazole",
            "category": "Proton Pump Inhibitor",
            "dosage_form": "Capsule",
            "strength": "20mg",
            "manufacturer": "GastroMed",
            "description": "Acid reflux treatment",
            "price": 85.25,
            "is_prescription_required": True
        }
    ]
    
    created_count = 0
    for med_data in medicines_data:
        medicine, created = Medicine.objects.get_or_create(
            name=med_data["name"],
            strength=med_data["strength"],
            defaults=med_data
        )
        if created:
            created_count += 1
            print(f"Created medicine: {medicine.name} {medicine.strength}")
        else:
            print(f"Medicine already exists: {medicine.name} {medicine.strength}")
    
    print(f"\nTotal medicines created: {created_count}")
    print(f"Total medicines in database: {Medicine.objects.count()}")

def main():
    print("🏥 Creating Sample Doctor Data...")
    print("=" * 50)
    
    # Create sample doctor
    doctor = create_sample_doctor()
    
    print("\n" + "=" * 50)
    
    # Create sample medicines
    create_sample_medicines()
    
    print("\n" + "=" * 50)
    print("✅ Sample data creation completed!")
    print("\n📋 Login Credentials:")
    print(f"Username: doctor1")
    print(f"Password: doctor123")
    print(f"Doctor ID: {doctor.doctor_id}")
    print(f"Specialization: {doctor.specialization}")
    print("\n🌐 Access the doctor dashboard at:")
    print("http://localhost:8080/doctor-dashboard.html")
    print("\n💡 Make sure the Django server is running:")
    print("python3 manage.py runserver")

if __name__ == "__main__":
    main()