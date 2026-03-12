from django.contrib import admin
from .models import Patient, MedicalRecord, Doctor, Medicine, Prescription, DoctorRecommendation

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'name', 'age', 'gender', 'location', 'phone', 'assigned_doctor', 'created_at']
    search_fields = ['patient_id', 'name', 'phone', 'location']
    list_filter = ['gender', 'location', 'assigned_doctor', 'created_at']
    readonly_fields = ['patient_id', 'qr_code', 'created_at', 'updated_at']

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'disease', 'doctor_name', 'doctor', 'visit_date', 'created_at']
    search_fields = ['patient__patient_id', 'patient__name', 'disease', 'doctor_name']
    list_filter = ['disease', 'doctor', 'visit_date', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['doctor_id', 'user', 'specialization', 'hospital', 'is_verified', 'created_at']
    search_fields = ['doctor_id', 'user__first_name', 'user__last_name', 'license_number']
    list_filter = ['specialization', 'is_verified', 'created_at']
    readonly_fields = ['doctor_id', 'created_at', 'updated_at']

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'strength', 'manufacturer', 'is_prescription_required']
    search_fields = ['name', 'generic_name', 'manufacturer']
    list_filter = ['category', 'dosage_form', 'is_prescription_required']

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'medicine', 'dosage', 'duration', 'is_active']
    search_fields = ['patient__name', 'doctor__user__first_name', 'medicine__name']
    list_filter = ['is_active', 'created_at']

@admin.register(DoctorRecommendation)
class DoctorRecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'doctor', 'recommendation_type', 'priority', 'is_completed']
    search_fields = ['title', 'patient__name', 'doctor__user__first_name']
    list_filter = ['recommendation_type', 'priority', 'is_completed']
