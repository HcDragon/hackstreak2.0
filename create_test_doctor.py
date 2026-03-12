#!/usr/bin/env python3
"""
Script to create a test doctor user
Run: python3 create_test_doctor.py
"""

import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_system.settings')
django.setup()

from django.contrib.auth.models import User
from patients.models import Doctor

def create_test_doctor():
    print("Creating test doctor...")
    
    # Create user
    username = "doctor1"
    password = "doctor123"
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists!")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name="John",
            last_name="Smith",
            email="doctor@example.com"
        )
        print(f"✓ Created user: {username}")
    
    # Check if doctor profile exists
    if Doctor.objects.filter(user=user).exists():
        print("Doctor profile already exists!")
        doctor = Doctor.objects.get(user=user)
    else:
        doctor = Doctor.objects.create(
            user=user,
            license_number="LIC12345",
            specialization="General Medicine",
            phone="9876543210",
            hospital="City Hospital",
            experience_years=5,
            is_verified=True
        )
        print(f"✓ Created doctor profile: {doctor.doctor_id}")
    
    print("\n" + "="*50)
    print("Test Doctor Created Successfully!")
    print("="*50)
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Doctor ID: {doctor.doctor_id}")
    print(f"Name: Dr. {user.first_name} {user.last_name}")
    print(f"Specialization: {doctor.specialization}")
    print("\n✅ You can now login to the doctor dashboard!")

if __name__ == '__main__':
    create_test_doctor()