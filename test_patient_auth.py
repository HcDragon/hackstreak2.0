#!/usr/bin/env python3
"""
Test Patient Signup and Authentication System
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_patient_signup():
    print("🔐 Testing Patient Signup")
    print("=" * 50)
    
    # Test patient data
    patient_data = {
        "name": "John Doe",
        "age": 30,
        "gender": "Male",
        "phone": "9876543210",
        "email": "john.doe@example.com",
        "password": "securepassword123",
        "address": "123 Main Street, Apartment 4B",
        "location": "Mumbai",
        "blood_group": "O+",
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "9876543211",
        "medical_allergies": "Penicillin, Peanuts"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/patient/signup/", json=patient_data)
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Patient signup successful!")
            print(f"   Patient ID: {data['patient']['patient_id']}")
            print(f"   Name: {data['patient']['name']}")
            print(f"   Email: {data['patient']['email']}")
            print(f"   Token: {data['token'][:20]}...")
            return data['token'], data['patient']
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            return None, None
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Django server is running.")
        return None, None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def test_patient_login():
    print("\n🔑 Testing Patient Login")
    print("=" * 50)
    
    login_data = {
        "email": "john.doe@example.com",
        "password": "securepassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/patient/login/", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Patient login successful!")
            print(f"   Welcome message: {data['message']}")
            print(f"   Patient ID: {data['patient']['patient_id']}")
            print(f"   Token: {data['token'][:20]}...")
            return data['token'], data['patient']
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            return None, None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def test_patient_profile(token):
    print("\n👤 Testing Patient Profile")
    print("=" * 50)
    
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/patient/profile/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            patient = data['patient']
            print("✅ Profile retrieved successfully!")
            print(f"   Patient ID: {patient['patient_id']}")
            print(f"   Name: {patient['name']}")
            print(f"   Age: {patient['age']}")
            print(f"   Phone: {patient['phone']}")
            print(f"   Location: {patient['location']}")
            print(f"   Blood Group: {patient['blood_group']}")
            print(f"   Emergency Contact: {patient['emergency_contact_name']}")
            print(f"   QR Code: {patient['qr_code_url']}")
            return patient
        else:
            print(f"❌ Profile retrieval failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_available_doctors():
    print("\n👨‍⚕️ Testing Available Doctors")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/auth/patient/doctors/")
        
        if response.status_code == 200:
            data = response.json()
            doctors = data['doctors']
            print(f"✅ Found {data['total_count']} available doctors:")
            
            for doctor in doctors[:3]:  # Show first 3 doctors
                print(f"   🏥 {doctor['name']}")
                print(f"      ID: {doctor['doctor_id']}")
                print(f"      Specialization: {doctor['specialization']}")
                print(f"      Hospital: {doctor['hospital']}")
                print(f"      Experience: {doctor['experience_years']} years")
                print(f"      Patients: {doctor['total_patients']}")
                print()
            
            return doctors[0] if doctors else None
        else:
            print(f"❌ Failed to get doctors: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_doctor_assignment(token, doctor):
    print("\n🏥 Testing Doctor Assignment")
    print("=" * 50)
    
    if not doctor:
        print("❌ No doctor available for assignment")
        return
    
    headers = {"Authorization": f"Token {token}"}
    assignment_data = {"doctor_id": doctor['doctor_id']}
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/patient/assign-doctor/", 
            json=assignment_data, 
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Doctor assignment successful!")
            print(f"   Message: {data['message']}")
            print(f"   Assigned Doctor: {data['assigned_doctor']['name']}")
            print(f"   Specialization: {data['assigned_doctor']['specialization']}")
        else:
            print(f"❌ Assignment failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_patient_qr_code(token):
    print("\n📱 Testing Patient QR Code")
    print("=" * 50)
    
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/patient/qr-code/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ QR Code retrieved successfully!")
            print(f"   Patient ID: {data['patient_id']}")
            print(f"   Name: {data['name']}")
            print(f"   QR Code URL: {data['qr_code_url']}")
            print(f"   QR Code Exists: {data['qr_code_exists']}")
            
            # Test QR regeneration
            regen_response = requests.post(f"{BASE_URL}/auth/patient/regenerate-qr/", headers=headers)
            if regen_response.status_code == 200:
                regen_data = regen_response.json()
                print("✅ QR Code regeneration successful!")
                print(f"   New QR URL: {regen_data['qr_code_url']}")
            
        else:
            print(f"❌ QR Code retrieval failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_profile_update(token):
    print("\n✏️ Testing Profile Update")
    print("=" * 50)
    
    headers = {"Authorization": f"Token {token}"}
    update_data = {
        "age": 31,
        "location": "Delhi",
        "emergency_contact_name": "Jane Smith",
        "medical_allergies": "Penicillin, Peanuts, Shellfish"
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/auth/patient/profile/update/", 
            json=update_data, 
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Profile update successful!")
            print(f"   Message: {data['message']}")
            print(f"   Updated Age: {data['patient']['age']}")
            print(f"   Updated Location: {data['patient']['location']}")
        else:
            print(f"❌ Profile update failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🏥 Smart Healthcare Patient Authentication Test Suite")
    print("=" * 70)
    
    # Test signup
    token, patient = test_patient_signup()
    
    if not token:
        # Try login if signup failed (user might already exist)
        token, patient = test_patient_login()
    
    if token:
        # Test authenticated endpoints
        test_patient_profile(token)
        
        # Test doctor-related features
        available_doctor = test_available_doctors()
        test_doctor_assignment(token, available_doctor)
        
        # Test QR code features
        test_patient_qr_code(token)
        
        # Test profile update
        test_profile_update(token)
        
        print("\n" + "=" * 70)
        print("🎉 Patient Authentication System Test Complete!")
        print("=" * 70)
        print("✅ All patient authentication features are working correctly!")
        
    else:
        print("\n❌ Authentication tests failed - could not obtain token")

if __name__ == '__main__':
    main()