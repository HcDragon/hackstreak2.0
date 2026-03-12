from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MedicalRecordViewSet, regenerate_patient_qr
from .ai_views import (
    outbreak_prediction,
    disease_recommendations,
    patient_risk_assessment,
    real_time_alerts
)
from .report_upload_views import upload_medical_report, get_patient_reports
from .debug_views import debug_pdf_analysis, test_text_analysis, test_ai_connection
from .doctor_views import (
    doctor_login, doctor_logout, doctor_dashboard, doctor_patients,
    doctor_medical_records, delete_medical_record, doctor_medicines, doctor_prescriptions
)
from .patient_auth_views import (
    patient_signup, patient_login, patient_logout, patient_profile,
    update_patient_profile, patient_medical_history, available_doctors,
    request_doctor_assignment, patient_qr_code, regenerate_patient_qr as patient_regenerate_qr
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'medical-records', MedicalRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Patient Authentication endpoints
    path('auth/patient/signup/', patient_signup, name='patient-signup'),
    path('auth/patient/login/', patient_login, name='patient-login'),
    path('auth/patient/logout/', patient_logout, name='patient-logout'),
    path('auth/patient/profile/', patient_profile, name='patient-profile'),
    path('auth/patient/profile/update/', update_patient_profile, name='update-patient-profile'),
    path('auth/patient/medical-history/', patient_medical_history, name='patient-medical-history'),
    path('auth/patient/qr-code/', patient_qr_code, name='patient-qr-code'),
    path('auth/patient/regenerate-qr/', patient_regenerate_qr, name='patient-regenerate-qr'),
    path('auth/patient/doctors/', available_doctors, name='available-doctors'),
    path('auth/patient/assign-doctor/', request_doctor_assignment, name='request-doctor-assignment'),
    # Patient QR endpoints (admin)
    path('patients/<int:pk>/regenerate_qr/', regenerate_patient_qr, name='regenerate-patient-qr'),
    # AI endpoints
    path('ai/outbreak-prediction/', outbreak_prediction, name='outbreak-prediction'),
    path('ai/recommendations/', disease_recommendations, name='disease-recommendations'),
    path('ai/risk-assessment/', patient_risk_assessment, name='risk-assessment'),
    path('ai/alerts/', real_time_alerts, name='real-time-alerts'),
    # Report upload endpoints
    path('reports/upload/', upload_medical_report, name='upload-report'),
    path('reports/patient/', get_patient_reports, name='patient-reports'),
    # Debug endpoints
    path('debug/pdf-analysis/', debug_pdf_analysis, name='debug-pdf'),
    path('debug/text-analysis/', test_text_analysis, name='debug-text'),
    path('debug/ai-connection/', test_ai_connection, name='debug-ai'),
    # Doctor endpoints
    path('doctor/login/', doctor_login, name='doctor-login'),
    path('doctor/logout/', doctor_logout, name='doctor-logout'),
    path('doctor/dashboard/', doctor_dashboard, name='doctor-dashboard'),
    path('doctor/patients/', doctor_patients, name='doctor-patients'),
    path('doctor/medical-records/', doctor_medical_records, name='doctor-medical-records'),
    path('doctor/medical-records/<int:record_id>/', delete_medical_record, name='delete-medical-record'),
    path('doctor/medicines/', doctor_medicines, name='doctor-medicines'),
    path('doctor/prescriptions/', doctor_prescriptions, name='doctor-prescriptions'),
]
