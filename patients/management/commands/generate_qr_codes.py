from django.core.management.base import BaseCommand
from patients.models import Patient

class Command(BaseCommand):
    help = 'Generate QR codes for all patients'

    def add_arguments(self, parser):
        parser.add_argument(
            '--regenerate',
            action='store_true',
            help='Regenerate QR codes for all patients (including existing ones)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting QR code generation...'))
        
        patients = Patient.objects.all()
        total = patients.count()
        success_count = 0
        
        for i, patient in enumerate(patients, 1):
            self.stdout.write(f'Processing {i}/{total}: {patient.patient_id} - {patient.name}')
            
            try:
                if options['regenerate'] or not patient.qr_code:
                    if options['regenerate'] and patient.qr_code:
                        patient.qr_code.delete(save=False)
                    
                    success = patient.generate_qr_code()
                    if success:
                        success_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ QR code generated for {patient.patient_id}')
                        )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'  ✗ Failed to generate QR code for {patient.patient_id}')
                        )
                else:
                    self.stdout.write(f'  - QR code already exists for {patient.patient_id}')
                    success_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error processing {patient.patient_id}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted: {success_count}/{total} patients have QR codes'
            )
        )