from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Doctor, Medicine, Prescription, DoctorRecommendation, Patient, MedicalRecord

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_patients = serializers.SerializerMethodField()
    total_records = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ['doctor_id', 'created_at', 'updated_at']
    
    def get_total_patients(self, obj):
        return obj.patients.count()
    
    def get_total_records(self, obj):
        return MedicalRecord.objects.filter(doctor=obj).count()

class MedicineSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class PrescriptionSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['created_at']

class DoctorRecommendationSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    patient = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = DoctorRecommendation
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PatientDetailSerializer(serializers.ModelSerializer):
    medical_records = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    assigned_doctor = DoctorSerializer(read_only=True)
    latest_record = serializers.SerializerMethodField()
    total_visits = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['patient_id', 'qr_code', 'created_at', 'updated_at']
    
    def get_medical_records(self, obj):
        records = obj.medical_records.all()[:5]  # Latest 5 records
        return MedicalRecordDetailSerializer(records, many=True).data
    
    def get_qr_code_url(self, obj):
        if obj.qr_code:
            return obj.qr_code.url
        return None
    
    def get_latest_record(self, obj):
        latest = obj.medical_records.first()
        if latest:
            return MedicalRecordDetailSerializer(latest).data
        return None
    
    def get_total_visits(self, obj):
        return obj.medical_records.count()

class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class CreateMedicalRecordSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, required=False)
    recommendations = DoctorRecommendationSerializer(many=True, required=False)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        recommendations_data = validated_data.pop('recommendations', [])
        
        medical_record = MedicalRecord.objects.create(**validated_data)
        
        # Create prescriptions
        for prescription_data in prescriptions_data:
            Prescription.objects.create(medical_record=medical_record, **prescription_data)
        
        # Create recommendations
        for recommendation_data in recommendations_data:
            DoctorRecommendation.objects.create(
                medical_record=medical_record,
                doctor=validated_data['doctor'],
                patient=validated_data['patient'],
                **recommendation_data
            )
        
        return medical_record