from django.db import models
from django.contrib.auth.models import User
import qrcode
from io import BytesIO
from django.core.files import File

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    doctor_id = models.CharField(max_length=20, unique=True, editable=False)
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    hospital = models.CharField(max_length=200)
    experience_years = models.IntegerField()
    profile_image = models.ImageField(upload_to='doctor_profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            last_doctor = Doctor.objects.all().order_by('id').last()
            if last_doctor:
                self.doctor_id = f"DOC{int(last_doctor.doctor_id[3:]) + 1:05d}"
            else:
                self.doctor_id = "DOC00001"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} ({self.doctor_id})"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    patient_id = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=200)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    location = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    medical_allergies = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Generate patient ID if not exists
        if not self.patient_id:
            last_patient = Patient.objects.all().order_by('id').last()
            if last_patient:
                self.patient_id = f"PAT{int(last_patient.patient_id[3:]) + 1:05d}"
            else:
                self.patient_id = "PAT00001"
        
        # Save the patient first
        super().save(*args, **kwargs)
        
        # Generate QR code if not exists
        if not self.qr_code:
            self.generate_qr_code()
    
    def generate_qr_code(self):
        """Generate QR code for the patient"""
        try:
            import qrcode
            from io import BytesIO
            from django.core.files import File
            
            # Create QR data
            qr_data = f"Patient ID: {self.patient_id}\nName: {self.name}\nAge: {self.age}\nGender: {self.gender}\nPhone: {self.phone}\nLocation: {self.location}\nBlood Group: {self.blood_group or 'Not specified'}"
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save to buffer
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Save to model
            file_name = f'qr_{self.patient_id}.png'
            self.qr_code.save(file_name, File(buffer), save=False)
            buffer.close()
            
            # Update only the qr_code field
            super().save(update_fields=['qr_code'])
            
            print(f"✓ QR code generated for {self.patient_id}")
            return True
            
        except Exception as e:
            print(f"✗ QR code generation failed for {self.patient_id}: {e}")
            return False

    def regenerate_qr_code(self):
        """Regenerate QR code (useful for updates)"""
        if self.qr_code:
            self.qr_code.delete(save=False)
        return self.generate_qr_code()
    
    def get_qr_code_url(self):
        """Get QR code URL with fallback"""
        if self.qr_code and hasattr(self.qr_code, 'url'):
            return self.qr_code.url
        return None

    def __str__(self):
        return f"{self.patient_id} - {self.name}"

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    disease = models.CharField(max_length=200)
    symptoms = models.TextField()
    diagnosis = models.TextField()
    prescription = models.TextField()
    doctor_name = models.CharField(max_length=200)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_records')
    visit_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-visit_date']

    def __str__(self):
        return f"{self.patient.patient_id} - {self.disease} - {self.visit_date}"

class Medicine(models.Model):
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True, null=True)
    category = models.CharField(max_length=100)
    dosage_form = models.CharField(max_length=50)  # tablet, capsule, syrup, injection
    strength = models.CharField(max_length=50)  # 500mg, 10ml, etc.
    manufacturer = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    side_effects = models.TextField(blank=True, null=True)
    contraindications = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='medicine_images/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_prescription_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.strength})"

class Prescription(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)  # "1 tablet twice daily"
    duration = models.CharField(max_length=50)  # "7 days", "2 weeks"
    instructions = models.TextField(blank=True, null=True)  # "Take after meals"
    quantity = models.IntegerField()  # Number of tablets/bottles prescribed
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine.name} - {self.dosage} for {self.duration}"

class DoctorRecommendation(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, null=True, blank=True)
    recommendation_type = models.CharField(
        max_length=20,
        choices=[
            ('lifestyle', 'Lifestyle'),
            ('diet', 'Diet'),
            ('exercise', 'Exercise'),
            ('medication', 'Medication'),
            ('follow_up', 'Follow-up'),
            ('prevention', 'Prevention')
        ]
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')],
        default='medium'
    )
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.patient.name}"
