from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Patient, Doctor

class PatientSignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    age = serializers.IntegerField(min_value=0, max_value=150)
    gender = serializers.ChoiceField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    address = serializers.CharField()
    location = serializers.CharField(max_length=100)
    blood_group = serializers.CharField(max_length=5, required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    medical_allergies = serializers.CharField(required=False, allow_blank=True)
    assigned_doctor_id = serializers.CharField(max_length=20, required=False, allow_blank=True)

class PatientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class PatientProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    assigned_doctor_name = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    total_medical_records = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'name', 'age', 'gender', 'phone', 'email', 
            'user_email', 'address', 'location', 'blood_group', 
            'emergency_contact_name', 'emergency_contact_phone', 'medical_allergies',
            'assigned_doctor', 'assigned_doctor_name', 'qr_code_url', 
            'total_medical_records', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_id', 'created_at', 'updated_at']
    
    def get_assigned_doctor_name(self, obj):
        if obj.assigned_doctor:
            return f"Dr. {obj.assigned_doctor.user.first_name} {obj.assigned_doctor.user.last_name}"
        return None
    
    def get_qr_code_url(self, obj):
        return obj.get_qr_code_url()
    
    def get_total_medical_records(self, obj):
        return obj.medical_records.count()

class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'name', 'age', 'gender', 'phone', 'address', 'location', 
            'blood_group', 'emergency_contact_name', 'emergency_contact_phone', 
            'medical_allergies'
        ]
    
    def validate_age(self, value):
        if value < 0 or value > 150:
            raise serializers.ValidationError("Age must be between 0 and 150")
        return value
    
    def validate_phone(self, value):
        import re
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

class DoctorListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    total_patients = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'doctor_id', 'name', 'specialization', 'hospital', 
            'experience_years', 'total_patients'
        ]
    
    def get_name(self, obj):
        return f"Dr. {obj.user.first_name} {obj.user.last_name}"
    
    def get_total_patients(self, obj):
        return obj.patients.count()

class PatientMedicalHistorySerializer(serializers.Serializer):
    patient_id = serializers.CharField()
    patient_name = serializers.CharField()
    total_records = serializers.IntegerField()
    medical_records = serializers.ListField()