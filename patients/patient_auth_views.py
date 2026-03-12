from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from .models import Patient, Doctor
from .serializers import PatientSerializer
import re

@api_view(['POST'])
@permission_classes([AllowAny])
def patient_signup(request):
    """Patient registration endpoint"""
    
    # Extract data
    data = request.data
    
    # Validate required fields
    required_fields = ['name', 'age', 'gender', 'phone', 'email', 'address', 'location', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return Response({
            'error': f'Missing required fields: {", ".join(missing_fields)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email format
    email = data.get('email')
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return Response({
            'error': 'Invalid email format'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate phone format
    phone = data.get('phone')
    if not re.match(r'^\d{10}$', phone):
        return Response({
            'error': 'Phone number must be 10 digits'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate age
    try:
        age = int(data.get('age'))
        if age < 0 or age > 150:
            raise ValueError
    except (ValueError, TypeError):
        return Response({
            'error': 'Age must be a valid number between 0 and 150'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'User with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=email).exists():
        return Response({
            'error': 'User with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if phone already exists
    if Patient.objects.filter(phone=phone).exists():
        return Response({
            'error': 'Patient with this phone number already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Create User
            user = User.objects.create_user(
                username=email,  # Use email as username
                email=email,
                password=data.get('password'),
                first_name=data.get('name').split()[0] if data.get('name') else '',
                last_name=' '.join(data.get('name').split()[1:]) if len(data.get('name', '').split()) > 1 else ''
            )
            
            # Create Patient
            patient = Patient.objects.create(
                user=user,
                name=data.get('name'),
                age=age,
                gender=data.get('gender'),
                phone=phone,
                email=email,
                address=data.get('address'),
                location=data.get('location'),
                blood_group=data.get('blood_group', ''),
                emergency_contact_name=data.get('emergency_contact_name', ''),
                emergency_contact_phone=data.get('emergency_contact_phone', ''),
                medical_allergies=data.get('medical_allergies', '')
            )
            
            # Auto-assign doctor if specified
            doctor_id = data.get('assigned_doctor_id')
            if doctor_id:
                try:
                    doctor = Doctor.objects.get(doctor_id=doctor_id, is_verified=True)
                    patient.assigned_doctor = doctor
                    patient.save()
                except Doctor.DoesNotExist:
                    pass  # Continue without assigning doctor
            
            # Create authentication token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'success': True,
                'message': 'Patient registered successfully',
                'patient': PatientSerializer(patient).data,
                'token': token.key,
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def patient_login(request):
    """Patient login endpoint"""
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate user
    user = authenticate(username=email, password=password)
    
    if user:
        try:
            patient = Patient.objects.get(user=user)
            
            if not patient.is_active:
                return Response({
                    'error': 'Patient account is deactivated'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'success': True,
                'message': f'Welcome {patient.name}',
                'patient': PatientSerializer(patient).data,
                'token': token.key,
                'user_id': user.id
            })
            
        except Patient.DoesNotExist:
            return Response({
                'error': 'Patient profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def patient_logout(request):
    """Patient logout endpoint"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_profile(request):
    """Get patient profile"""
    try:
        patient = Patient.objects.get(user=request.user)
        return Response({
            'patient': PatientSerializer(patient).data
        })
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_patient_profile(request):
    """Update patient profile"""
    try:
        patient = Patient.objects.get(user=request.user)
        data = request.data
        
        # Update allowed fields
        updatable_fields = [
            'name', 'age', 'gender', 'phone', 'address', 'location', 
            'blood_group', 'emergency_contact_name', 'emergency_contact_phone', 
            'medical_allergies'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'age':
                    try:
                        age = int(data[field])
                        if 0 <= age <= 150:
                            setattr(patient, field, age)
                    except (ValueError, TypeError):
                        return Response({
                            'error': 'Invalid age value'
                        }, status=status.HTTP_400_BAD_REQUEST)
                elif field == 'phone':
                    phone = data[field]
                    if re.match(r'^\d{10}$', phone):
                        # Check if phone is already taken by another patient
                        if Patient.objects.filter(phone=phone).exclude(id=patient.id).exists():
                            return Response({
                                'error': 'Phone number already taken'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        setattr(patient, field, phone)
                    else:
                        return Response({
                            'error': 'Phone number must be 10 digits'
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    setattr(patient, field, data[field])
        
        # Update user fields if provided
        if 'name' in data:
            name_parts = data['name'].split()
            request.user.first_name = name_parts[0] if name_parts else ''
            request.user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            request.user.save()
        
        patient.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'patient': PatientSerializer(patient).data
        })
        
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_medical_history(request):
    """Get patient's medical history"""
    try:
        patient = Patient.objects.get(user=request.user)
        records = patient.medical_records.all().order_by('-visit_date')
        
        from .serializers import MedicalRecordSerializer
        
        return Response({
            'patient_id': patient.patient_id,
            'patient_name': patient.name,
            'total_records': records.count(),
            'medical_records': MedicalRecordSerializer(records, many=True).data
        })
        
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_doctors(request):
    """Get list of available doctors for assignment"""
    doctors = Doctor.objects.filter(is_verified=True).select_related('user')
    
    doctors_data = []
    for doctor in doctors:
        doctors_data.append({
            'doctor_id': doctor.doctor_id,
            'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
            'specialization': doctor.specialization,
            'hospital': doctor.hospital,
            'experience_years': doctor.experience_years,
            'total_patients': doctor.patients.count()
        })
    
    return Response({
        'doctors': doctors_data,
        'total_count': len(doctors_data)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_doctor_assignment(request):
    """Request assignment to a specific doctor"""
    try:
        patient = Patient.objects.get(user=request.user)
        doctor_id = request.data.get('doctor_id')
        
        if not doctor_id:
            return Response({
                'error': 'Doctor ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doctor = Doctor.objects.get(doctor_id=doctor_id, is_verified=True)
            patient.assigned_doctor = doctor
            patient.save()
            
            return Response({
                'success': True,
                'message': f'Successfully assigned to Dr. {doctor.user.first_name} {doctor.user.last_name}',
                'assigned_doctor': {
                    'doctor_id': doctor.doctor_id,
                    'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                    'specialization': doctor.specialization,
                    'hospital': doctor.hospital
                }
            })
            
        except Doctor.DoesNotExist:
            return Response({
                'error': 'Doctor not found or not verified'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_qr_code(request):
    """Get patient's QR code"""
    try:
        patient = Patient.objects.get(user=request.user)
        
        # Generate QR code if it doesn't exist
        if not patient.qr_code:
            patient.generate_qr_code()
        
        qr_url = patient.get_qr_code_url()
        
        return Response({
            'patient_id': patient.patient_id,
            'name': patient.name,
            'qr_code_url': qr_url,
            'qr_code_exists': bool(qr_url)
        })
        
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_patient_qr(request):
    """Regenerate patient's QR code"""
    try:
        patient = Patient.objects.get(user=request.user)
        success = patient.regenerate_qr_code()
        
        return Response({
            'success': success,
            'message': 'QR code regenerated successfully' if success else 'QR code generation failed',
            'qr_code_url': patient.get_qr_code_url()
        })
        
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient profile not found'
        }, status=status.HTTP_404_NOT_FOUND)