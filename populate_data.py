#!/usr/bin/env python3
"""
Script to populate the database with sample test data
Run: python3 populate_data.py
"""

import os
import django
import sys
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_system.settings')
django.setup()

from patients.models import Patient, MedicalRecord

# Sample data
LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune']
DISEASES = ['Dengue', 'Malaria', 'Typhoid', 'COVID-19', 'Tuberculosis', 'Influenza', 'Pneumonia', 'Cholera']
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
GENDERS = ['Male', 'Female']

SAMPLE_PATIENTS = [
    {'name': 'Rajesh Kumar', 'age': 45, 'phone': '9876543210'},
    {'name': 'Priya Sharma', 'age': 32, 'phone': '9876543211'},
    {'name': 'Amit Patel', 'age': 28, 'phone': '9876543212'},
    {'name': 'Sneha Reddy', 'age': 35, 'phone': '9876543213'},
    {'name': 'Vikram Singh', 'age': 52, 'phone': '9876543214'},
    {'name': 'Anita Desai', 'age': 41, 'phone': '9876543215'},
    {'name': 'Rahul Verma', 'age': 29, 'phone': '9876543216'},
    {'name': 'Kavita Nair', 'age': 38, 'phone': '9876543217'},
    {'name': 'Suresh Gupta', 'age': 55, 'phone': '9876543218'},
    {'name': 'Meera Iyer', 'age': 26, 'phone': '9876543219'},
]

DISEASE_SYMPTOMS = {
    'Dengue': 'High fever, severe headache, pain behind eyes, joint pain, rash',
    'Malaria': 'High fever with chills, sweating, headache, nausea, vomiting',
    'Typhoid': 'Prolonged fever, weakness, stomach pain, headache, loss of appetite',
    'COVID-19': 'Fever, dry cough, tiredness, loss of taste or smell, difficulty breathing',
    'Tuberculosis': 'Persistent cough, chest pain, coughing up blood, night sweats, weight loss',
    'Influenza': 'Fever, cough, sore throat, body aches, fatigue, headache',
    'Pneumonia': 'Cough with phlegm, fever, chills, difficulty breathing, chest pain',
    'Cholera': 'Severe diarrhea, vomiting, dehydration, muscle cramps'
}

DISEASE_DIAGNOSIS = {
    'Dengue': 'Dengue fever confirmed through NS1 antigen test',
    'Malaria': 'Malaria parasite detected in blood smear',
    'Typhoid': 'Typhoid confirmed through Widal test',
    'COVID-19': 'COVID-19 positive via RT-PCR test',
    'Tuberculosis': 'TB confirmed through chest X-ray and sputum test',
    'Influenza': 'Influenza A/B detected',
    'Pneumonia': 'Bacterial pneumonia confirmed via chest X-ray',
    'Cholera': 'Cholera confirmed through stool culture'
}

DISEASE_PRESCRIPTION = {
    'Dengue': 'Paracetamol for fever, plenty of fluids, rest, monitor platelet count',
    'Malaria': 'Antimalarial drugs (Chloroquine/Artemisinin), fluids, rest',
    'Typhoid': 'Antibiotics (Ciprofloxacin/Azithromycin), fluids, soft diet',
    'COVID-19': 'Isolation, symptomatic treatment, oxygen if needed, antiviral if severe',
    'Tuberculosis': 'Anti-TB drugs (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol) for 6 months',
    'Influenza': 'Antiviral drugs (Oseltamivir), rest, fluids, symptomatic treatment',
    'Pneumonia': 'Antibiotics, rest, fluids, oxygen therapy if needed',
    'Cholera': 'ORS, IV fluids, antibiotics (Doxycycline/Azithromycin)'
}

DOCTORS = ['Dr. Sharma', 'Dr. Patel', 'Dr. Kumar', 'Dr. Singh', 'Dr. Reddy', 'Dr. Mehta']

def create_patients():
    """Create sample patients"""
    print("Creating patients...")
    patients = []
    
    for patient_data in SAMPLE_PATIENTS:
        patient = Patient.objects.create(
            name=patient_data['name'],
            age=patient_data['age'],
            gender=random.choice(GENDERS),
            phone=patient_data['phone'],
            email=f"{patient_data['name'].lower().replace(' ', '.')}@example.com",
            address=f"{random.randint(1, 999)} {random.choice(['MG Road', 'Park Street', 'Main Street', 'Gandhi Road'])}",
            location=random.choice(LOCATIONS),
            blood_group=random.choice(BLOOD_GROUPS)
        )
        patients.append(patient)
        print(f"  ✓ Created patient: {patient.patient_id} - {patient.name}")
    
    return patients

def create_medical_records(patients):
    """Create sample medical records"""
    print("\nCreating medical records...")
    
    # Create records for last 30 days
    for i in range(50):
        patient = random.choice(patients)
        disease = random.choice(DISEASES)
        
        # Random date in last 30 days
        days_ago = random.randint(0, 30)
        visit_date = datetime.now().date() - timedelta(days=days_ago)
        
        record = MedicalRecord.objects.create(
            patient=patient,
            disease=disease,
            symptoms=DISEASE_SYMPTOMS[disease],
            diagnosis=DISEASE_DIAGNOSIS[disease],
            prescription=DISEASE_PRESCRIPTION[disease],
            doctor_name=random.choice(DOCTORS),
            visit_date=visit_date,
            notes=f"Patient responded well to treatment. Follow-up recommended."
        )
        print(f"  ✓ Added record: {patient.patient_id} - {disease} ({visit_date})")
    
    # Create some outbreak scenarios (multiple cases of same disease in same location)
    print("\n  Creating outbreak scenarios...")
    outbreak_disease = random.choice(DISEASES)
    outbreak_location = random.choice(LOCATIONS)
    
    outbreak_patients = [p for p in patients if p.location == outbreak_location][:3]
    
    for patient in outbreak_patients:
        for i in range(2):
            days_ago = random.randint(0, 7)
            visit_date = datetime.now().date() - timedelta(days=days_ago)
            
            MedicalRecord.objects.create(
                patient=patient,
                disease=outbreak_disease,
                symptoms=DISEASE_SYMPTOMS[outbreak_disease],
                diagnosis=DISEASE_DIAGNOSIS[outbreak_disease],
                prescription=DISEASE_PRESCRIPTION[outbreak_disease],
                doctor_name=random.choice(DOCTORS),
                visit_date=visit_date,
                notes=f"Part of {outbreak_location} outbreak cluster"
            )
    
    print(f"  ✓ Created outbreak scenario: {outbreak_disease} in {outbreak_location}")

def main():
    print("=" * 60)
    print("Smart Healthcare System - Database Population Script")
    print("=" * 60)
    
    # Clear existing data
    print("\nClearing existing data...")
    MedicalRecord.objects.all().delete()
    Patient.objects.all().delete()
    print("  ✓ Database cleared")
    
    # Create new data
    patients = create_patients()
    create_medical_records(patients)
    
    # Summary
    print("\n" + "=" * 60)
    print("Database Population Complete!")
    print("=" * 60)
    print(f"Total Patients: {Patient.objects.count()}")
    print(f"Total Medical Records: {MedicalRecord.objects.count()}")
    print(f"Unique Diseases: {MedicalRecord.objects.values('disease').distinct().count()}")
    print(f"Locations Covered: {Patient.objects.values('location').distinct().count()}")
    print("\n✅ You can now test the system with this sample data!")
    print("   - Open http://localhost:8000/admin to view in admin panel")
    print("   - Open frontend to test APIs")
    print("   - Check AI predictions and alerts")

if __name__ == '__main__':
    main()
