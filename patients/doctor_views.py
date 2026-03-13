from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import Doctor, Medicine, Prescription, DoctorRecommendation, Patient, MedicalRecord
from .doctor_serializers import (
    DoctorSerializer, MedicineSerializer, PrescriptionSerializer,
    DoctorRecommendationSerializer, PatientDetailSerializer,
    MedicalRecordDetailSerializer, CreateMedicalRecordSerializer
)
from .report_upload_views import analyze_pdf_report
import os
from django.conf import settings

@api_view(['POST'])
def doctor_login(request):
    """Doctor login endpoint with token authentication"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        try:
            doctor = Doctor.objects.get(user=user)
            if not doctor.is_verified:
                return Response({'error': 'Doctor account not verified'}, status=status.HTTP_403_FORBIDDEN)
            
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'success': True,
                'token': token.key,
                'doctor': DoctorSerializer(doctor).data,
                'message': f'Welcome Dr. {user.first_name} {user.last_name}'
            })
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_logout(request):
    """Doctor logout endpoint - delete token"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'success': True, 'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard(request):
    """Get doctor dashboard statistics"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get today's date
    today = datetime.now().date()
    
    # Get statistics
    total_patients = Patient.objects.filter(assigned_doctor=doctor).count()
    total_records = MedicalRecord.objects.filter(doctor=doctor).count()
    today_visits = MedicalRecord.objects.filter(doctor=doctor, visit_date=today).count()
    total_prescriptions = Prescription.objects.filter(doctor=doctor).count()
    
    return Response({
        'doctor': DoctorSerializer(doctor).data,
        'stats': {
            'total_patients': total_patients,
            'total_records': total_records,
            'today_visits': today_visits,
            'total_prescriptions': total_prescriptions
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """Get all patients assigned to the doctor"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all patients (for now, show all patients since assignment might not be set up)
    patients = Patient.objects.all()
    
    # Add medical records count for each patient
    patients_data = []
    for patient in patients:
        patient_data = PatientDetailSerializer(patient).data
        patient_data['medical_records_count'] = patient.medical_records.count()
        patients_data.append(patient_data)
    
    return Response(patients_data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_medical_records(request):
    """Get or create medical records"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get all medical records for this doctor
        records = MedicalRecord.objects.filter(doctor=doctor).order_by('-visit_date')
        records_data = []
        for record in records:
            record_data = MedicalRecordDetailSerializer(record).data
            record_data['patient_name'] = record.patient.name
            records_data.append(record_data)
        return Response(records_data)
    
    elif request.method == 'POST':
        # Create new medical record
        data = request.data.copy()
        data['doctor'] = doctor.id
        data['doctor_name'] = f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
        
        serializer = CreateMedicalRecordSerializer(data=data)
        if serializer.is_valid():
            medical_record = serializer.save()
            return Response({
                'success': True,
                'message': 'Medical record created successfully',
                'record': MedicalRecordDetailSerializer(medical_record).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_medical_record(request, record_id):
    """Delete medical record"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        record = MedicalRecord.objects.get(id=record_id, doctor=doctor)
        record.delete()
        return Response({'success': True, 'message': 'Medical record deleted successfully'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except MedicalRecord.DoesNotExist:
        return Response({'error': 'Medical record not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_medicines(request):
    """Get or create medicines"""
    if request.method == 'GET':
        medicines = Medicine.objects.all().order_by('name')
        return Response(MedicineSerializer(medicines, many=True).data)
    
    elif request.method == 'POST':
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            medicine = serializer.save()
            return Response({
                'success': True,
                'message': 'Medicine added successfully',
                'medicine': MedicineSerializer(medicine).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_prescriptions(request):
    """Get or create prescriptions"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        prescriptions = Prescription.objects.filter(doctor=doctor).order_by('-created_at')
        prescriptions_data = []
        for prescription in prescriptions:
            prescription_data = PrescriptionSerializer(prescription).data
            prescription_data['patient_name'] = prescription.patient.name
            prescription_data['medicine_name'] = prescription.medicine.name
            prescriptions_data.append(prescription_data)
        return Response(prescriptions_data)
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['doctor'] = doctor.id
        
        serializer = PrescriptionSerializer(data=data)
        if serializer.is_valid():
            prescription = serializer.save()
            return Response({
                'success': True,
                'message': 'Prescription created successfully',
                'prescription': PrescriptionSerializer(prescription).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def patient_detail(request, patient_id):
    """Get, update, or delete patient details"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = Patient.objects.get(patient_id=patient_id, assigned_doctor=doctor)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(PatientDetailSerializer(patient).data)
    
    elif request.method == 'PUT':
        serializer = PatientDetailSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        patient.delete()
        return Response({'success': True, 'message': 'Patient deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_medical_record(request):
    """Create a new medical record"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Add doctor to the data
    data = request.data.copy()
    data['doctor'] = doctor.id
    data['doctor_name'] = f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
    
    serializer = CreateMedicalRecordSerializer(data=data)
    if serializer.is_valid():
        medical_record = serializer.save()
        return Response({
            'success': True,
            'message': 'Medical record created successfully',
            'record': MedicalRecordDetailSerializer(medical_record).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medical_record_detail(request, record_id):
    """Get, update, or delete medical record"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        record = MedicalRecord.objects.get(id=record_id, doctor=doctor)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except MedicalRecord.DoesNotExist:
        return Response({'error': 'Medical record not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(MedicalRecordDetailSerializer(record).data)
    
    elif request.method == 'PUT':
        serializer = MedicalRecordDetailSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        record.delete()
        return Response({'success': True, 'message': 'Medical record deleted successfully'})

class MedicineViewSet(viewsets.ModelViewSet):
    """Medicine management viewset"""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Medicine.objects.all()
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(manufacturer__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('name')
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all medicine categories"""
        categories = Medicine.objects.values_list('category', flat=True).distinct()
        return Response({'categories': list(categories)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_prescription(request, record_id):
    """Add prescription to medical record"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        record = MedicalRecord.objects.get(id=record_id, doctor=doctor)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except MedicalRecord.DoesNotExist:
        return Response({'error': 'Medical record not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['medical_record'] = record.id
    
    serializer = PrescriptionSerializer(data=data)
    if serializer.is_valid():
        prescription = serializer.save()
        return Response({
            'success': True,
            'message': 'Prescription added successfully',
            'prescription': PrescriptionSerializer(prescription).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_recommendation(request, patient_id):
    """Add recommendation for patient"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = Patient.objects.get(patient_id=patient_id, assigned_doctor=doctor)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['doctor'] = doctor.id
    data['patient'] = patient.id
    
    serializer = DoctorRecommendationSerializer(data=data)
    if serializer.is_valid():
        recommendation = serializer.save()
        return Response({
            'success': True,
            'message': 'Recommendation added successfully',
            'recommendation': DoctorRecommendationSerializer(recommendation).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_recommendations(request, patient_id):
    """Get all recommendations for a patient"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = Patient.objects.get(patient_id=patient_id, assigned_doctor=doctor)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    recommendations = DoctorRecommendation.objects.filter(
        doctor=doctor, 
        patient=patient
    ).order_by('-created_at')
    
    return Response({
        'recommendations': DoctorRecommendationSerializer(recommendations, many=True).data,
        'total_count': recommendations.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_patients(request):
    """Search patients across the system (for assignment)"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    search = request.query_params.get('search', '')
    if not search:
        return Response({'error': 'Search parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    patients = Patient.objects.filter(
        Q(name__icontains=search) | 
        Q(patient_id__icontains=search) |
        Q(phone__icontains=search)
    )[:20]  # Limit to 20 results
    
    return Response({
        'patients': PatientDetailSerializer(patients, many=True).data,
        'total_count': patients.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_patient(request, patient_id):
    """Assign patient to doctor"""
    try:
        doctor = Doctor.objects.get(user=request.user)
        patient = Patient.objects.get(patient_id=patient_id)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    patient.assigned_doctor = doctor
    patient.save()
    
    return Response({
        'success': True,
        'message': f'Patient {patient.name} assigned successfully',
        'patient': PatientDetailSerializer(patient).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_medical_document(request):
    """Upload and analyze medical document (PDF)"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    patient_id = request.data.get('patient_id')
    
    # Validate file type
    if not uploaded_file.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files are allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (10MB limit)
    if uploaded_file.size > 10 * 1024 * 1024:
        return Response({'error': 'File size too large. Maximum 10MB allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate patient if provided
    patient = None
    if patient_id:
        try:
            patient = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Save file temporarily
        temp_reports_dir = os.path.join(settings.MEDIA_ROOT, 'temp_reports')
        os.makedirs(temp_reports_dir, exist_ok=True)
        
        file_path = os.path.join(temp_reports_dir, f"doctor_{doctor.id}_{uploaded_file.name}")
        
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Analyze the PDF
        analysis_result = analyze_pdf_report(file_path)
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        if analysis_result['success']:
            analysis_data = analysis_result['analysis']
            
            # If patient is provided and analysis is successful, create medical record
            if patient and analysis_data.get('disease'):
                medical_record_data = {
                    'patient': patient.id,
                    'doctor': doctor.id,
                    'disease': analysis_data.get('disease', 'Unknown'),
                    'symptoms': analysis_data.get('symptoms', ''),
                    'diagnosis': analysis_data.get('diagnosis', ''),
                    'prescription': analysis_data.get('prescription', ''),
                    'doctor_name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                    'visit_date': datetime.now().date(),
                    'notes': f"Created from uploaded document. Risk Level: {analysis_data.get('risk_level', 'Unknown')}"
                }
                
                serializer = CreateMedicalRecordSerializer(data=medical_record_data)
                if serializer.is_valid():
                    medical_record = serializer.save()
                    analysis_result['medical_record_created'] = True
                    analysis_result['medical_record_id'] = medical_record.id
                else:
                    analysis_result['medical_record_error'] = serializer.errors
            
            return Response({
                'success': True,
                'message': 'Document analyzed successfully',
                'analysis': analysis_result,
                'doctor': f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
            })
        else:
            return Response({
                'success': False,
                'error': analysis_result.get('error', 'Analysis failed'),
                'message': 'Failed to analyze document'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Error processing document'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)