from rest_framework import serializers
from .models import Patient, MedicalRecord
from .patient_serializers import PatientProfileSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PatientSerializer(serializers.ModelSerializer):
    medical_records = MedicalRecordSerializer(many=True, read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    assigned_doctor_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['patient_id', 'qr_code', 'created_at', 'updated_at']

    def get_qr_code_url(self, obj):
        return obj.get_qr_code_url()
    
    def get_assigned_doctor_name(self, obj):
        if obj.assigned_doctor:
            return f"Dr. {obj.assigned_doctor.user.first_name} {obj.assigned_doctor.user.last_name}"
        return None
