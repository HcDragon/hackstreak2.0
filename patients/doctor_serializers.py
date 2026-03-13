from rest_framework import serializers
from .models import Doctor, Medicine, Prescription, DoctorRecommendation, Patient, MedicalRecord

class DoctorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ['id', 'doctor_id', 'name', 'specialization', 'phone', 'hospital', 'experience_years', 'is_verified']
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class DoctorRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorRecommendation
        fields = '__all__'

class PatientDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = '__all__'

class CreateMedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['patient', 'disease', 'symptoms', 'diagnosis', 'prescription', 'doctor', 'doctor_name', 'visit_date', 'notes']