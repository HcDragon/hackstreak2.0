#!/usr/bin/env python3
"""
Test QR Code API Endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_patient_qr_endpoints():
    print("Testing QR Code API Endpoints...")
    
    try:
        # Test getting all patients
        response = requests.get(f"{BASE_URL}/patients/")
        if response.status_code == 200:
            patients = response.json()
            print(f"✓ Found {len(patients)} patients")
            
            if patients:
                patient = patients[0]
                patient_id = patient['id']
                patient_code = patient['patient_id']
                
                print(f"Testing with patient: {patient_code} - {patient['name']}")
                
                # Test QR code endpoint
                qr_response = requests.get(f"{BASE_URL}/patients/{patient_id}/qr_code/")
                if qr_response.status_code == 200:
                    qr_data = qr_response.json()
                    print(f"✓ QR Code endpoint working")
                    print(f"  - Patient ID: {qr_data['patient_id']}")
                    print(f"  - QR Code URL: {qr_data.get('qr_code_url', 'None')}")
                    print(f"  - QR Code Exists: {qr_data.get('qr_code_exists', False)}")
                    
                    # Test regenerate QR endpoint
                    regen_response = requests.post(f"{BASE_URL}/patients/{patient_id}/regenerate_qr/")
                    if regen_response.status_code == 200:
                        regen_data = regen_response.json()
                        print(f"✓ QR Regeneration endpoint working")
                        print(f"  - Success: {regen_data['success']}")
                        print(f"  - Message: {regen_data['message']}")
                    else:
                        print(f"✗ QR Regeneration failed: {regen_response.status_code}")
                        
                else:
                    print(f"✗ QR Code endpoint failed: {qr_response.status_code}")
                    print(f"Response: {qr_response.text}")
            else:
                print("No patients found")
        else:
            print(f"✗ Failed to get patients: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"✗ Error: {e}")

def test_patient_search_with_qr():
    print("\nTesting Patient Search with QR...")
    
    try:
        # Test search endpoint
        response = requests.get(f"{BASE_URL}/patients/search/?patient_id=PAT00001")
        if response.status_code == 200:
            patient = response.json()
            print(f"✓ Patient search working")
            print(f"  - Patient: {patient['patient_id']} - {patient['name']}")
            print(f"  - QR Code URL: {patient.get('qr_code_url', 'None')}")
            
            if patient.get('qr_code_url'):
                # Try to access the QR code file
                qr_url = f"http://localhost:8000{patient['qr_code_url']}"
                qr_file_response = requests.get(qr_url)
                if qr_file_response.status_code == 200:
                    print(f"✓ QR Code file accessible at: {qr_url}")
                    print(f"  - File size: {len(qr_file_response.content)} bytes")
                else:
                    print(f"✗ QR Code file not accessible: {qr_file_response.status_code}")
            else:
                print("✗ No QR code URL found")
        else:
            print(f"✗ Patient search failed: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_patient_qr_endpoints()
    test_patient_search_with_qr()