export const cities = [
  'Mumbai', 'Pune', 'Delhi', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Jaipur'
];

export const diseaseNames = [
  'Dengue', 'Malaria', 'Typhoid', 'COVID-19', 'Cholera', 'Tuberculosis', 'Chikungunya', 'Pneumonia'
];

export const doctors = [
  { id: 'DOC-001', name: 'Dr. Aarav Mehta', specialization: 'General Physician', assignedPatients: ['PAT-0001', 'PAT-0002', 'PAT00001', 'PAT00002'] },
  { id: 'DOC-002', name: 'Dr. Priya Sharma', specialization: 'Infectious Diseases', assignedPatients: ['PAT-0001', 'PAT00001'] }
];

export const patients = [
  { 
    id: 'PAT-0001', 
    patient_id: 'PAT00001',
    name: 'Amit Kumar', 
    age: 34, 
    gender: 'Male', 
    bloodGroup: 'O+',
    blood_group: 'O+',
    contact: '9876543210',
    city: 'Mumbai',
    location: 'Mumbai',
    phone: '9876543210', 
    email: 'amit.kumar@example.com',
    address: 'Mumbai, Maharashtra',
    emergencyContact: '9876543211',
    emergency_contact: '9876543211',
    medicalHistory: ['Dengue (2023)'],
    currentMedications: [],
    diseases: [{ name: 'Dengue', year: 2023, hospital: 'Lilavati Hospital', treatment: 'IV Fluids, Paracetamol' }], 
    prescriptions: [], 
    appointments: [], 
    reports: [] 
  },
  { 
    id: 'PAT-0002', 
    patient_id: 'PAT00002',
    name: 'Sneha Rao', 
    age: 28, 
    gender: 'Female', 
    bloodGroup: 'A+',
    blood_group: 'A+',
    contact: '9876543212',
    city: 'Pune',
    location: 'Pune',
    phone: '9876543212',
    email: 'sneha.rao@example.com',
    address: 'Pune, Maharashtra',
    emergencyContact: '9876543213',
    emergency_contact: '9876543213',
    medicalHistory: ['Malaria (2023)'],
    currentMedications: [],
    diseases: [{ name: 'Malaria', year: 2023, hospital: 'Ruby Hall Clinic', treatment: 'Antimalarial drugs, Rest' }], 
    prescriptions: [], 
    appointments: [], 
    reports: [] 
  }
];

export const mockPatients = patients;

// Initialize localStorage with mock patients if not already present
if (typeof window !== 'undefined' && !localStorage.getItem('mockPatients')) {
  localStorage.setItem('mockPatients', JSON.stringify(patients));
}
