from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from patients.models import Doctor

class Command(BaseCommand):
    help = 'Create sample doctors for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample doctors...'))
        
        doctors_data = [
            {
                'username': 'dr.smith',
                'first_name': 'John',
                'last_name': 'Smith',
                'email': 'dr.smith@hospital.com',
                'license_number': 'LIC001',
                'specialization': 'General Medicine',
                'hospital': 'City General Hospital',
                'experience_years': 10,
                'phone': '9876543201'
            },
            {
                'username': 'dr.patel',
                'first_name': 'Priya',
                'last_name': 'Patel',
                'email': 'dr.patel@hospital.com',
                'license_number': 'LIC002',
                'specialization': 'Cardiology',
                'hospital': 'Heart Care Center',
                'experience_years': 15,
                'phone': '9876543202'
            },
            {
                'username': 'dr.kumar',
                'first_name': 'Rajesh',
                'last_name': 'Kumar',
                'email': 'dr.kumar@hospital.com',
                'license_number': 'LIC003',
                'specialization': 'Pediatrics',
                'hospital': 'Children\'s Hospital',
                'experience_years': 8,
                'phone': '9876543203'
            },
            {
                'username': 'dr.sharma',
                'first_name': 'Anita',
                'last_name': 'Sharma',
                'email': 'dr.sharma@hospital.com',
                'license_number': 'LIC004',
                'specialization': 'Dermatology',
                'hospital': 'Skin Care Clinic',
                'experience_years': 12,
                'phone': '9876543204'
            },
            {
                'username': 'dr.singh',
                'first_name': 'Vikram',
                'last_name': 'Singh',
                'email': 'dr.singh@hospital.com',
                'license_number': 'LIC005',
                'specialization': 'Orthopedics',
                'hospital': 'Bone & Joint Hospital',
                'experience_years': 18,
                'phone': '9876543205'
            }
        ]
        
        created_count = 0
        
        for doctor_data in doctors_data:
            # Check if user already exists
            if User.objects.filter(username=doctor_data['username']).exists():
                self.stdout.write(f'  - Doctor {doctor_data["username"]} already exists')
                continue
            
            try:
                # Create user
                user = User.objects.create_user(
                    username=doctor_data['username'],
                    email=doctor_data['email'],
                    password='doctor123',  # Default password
                    first_name=doctor_data['first_name'],
                    last_name=doctor_data['last_name']
                )
                
                # Create doctor profile
                doctor = Doctor.objects.create(
                    user=user,
                    license_number=doctor_data['license_number'],
                    specialization=doctor_data['specialization'],
                    hospital=doctor_data['hospital'],
                    experience_years=doctor_data['experience_years'],
                    phone=doctor_data['phone'],
                    is_verified=True  # Auto-verify for testing
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ Created Dr. {doctor.user.first_name} {doctor.user.last_name} '
                        f'({doctor.doctor_id}) - {doctor.specialization}'
                    )
                )
                created_count += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed to create {doctor_data["username"]}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted: {created_count} doctors created')
        )
        
        # Show login credentials
        if created_count > 0:
            self.stdout.write('\n' + '='*50)
            self.stdout.write('Doctor Login Credentials:')
            self.stdout.write('='*50)
            for doctor_data in doctors_data:
                if not User.objects.filter(username=doctor_data['username']).exists():
                    continue
                self.stdout.write(f'Username: {doctor_data["username"]}')
                self.stdout.write(f'Password: doctor123')
                self.stdout.write(f'Email: {doctor_data["email"]}')
                self.stdout.write('-' * 30)