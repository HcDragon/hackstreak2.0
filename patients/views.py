from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Patient, MedicalRecord
from .serializers import PatientSerializer, MedicalRecordSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        patient = self.get_object()
        
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

    @action(detail=False, methods=['get'])
    def search(self, request):
        patient_id = request.query_params.get('patient_id', None)
        if patient_id:
            try:
                patient = Patient.objects.get(patient_id=patient_id)
                serializer = self.get_serializer(patient)
                return Response(serializer.data)
            except Patient.DoesNotExist:
                return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'patient_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        queryset = MedicalRecord.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        return queryset

    @action(detail=False, methods=['get'])
    def disease_stats(self, request):
        from django.db.models import Count
        stats = MedicalRecord.objects.values('disease', 'patient__location').annotate(count=Count('id'))
        return Response(stats)

@api_view(['POST'])
def regenerate_patient_qr(request, pk):
    """Regenerate QR code for a patient"""
    try:
        patient = Patient.objects.get(pk=pk)
        success = patient.regenerate_qr_code()
        
        return Response({
            'success': success,
            'message': 'QR code regenerated successfully' if success else 'QR code generation failed',
            'qr_code_url': patient.get_qr_code_url()
        })
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
