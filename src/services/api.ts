// API Service for Smart Healthcare System
// Connects React frontend to Django backend

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('patientToken') || localStorage.getItem('doctorToken') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({ error: 'Invalid response format' }));
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  return data;
};

// Authentication APIs
export const authAPI = {
  // Doctor login
  doctorLogin: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/doctor/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Admin login (with fallback to doctor login)
  adminLogin: async (credentials: { username: string; password: string }) => {
    // Try admin-specific endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await handleResponse(response);
    } catch (error) {
      // Fallback to doctor login for demo purposes
      console.log('Admin endpoint not available, using doctor login');
      
      // Check for hardcoded admin credentials
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          success: true,
          token: 'admin-demo-token-' + Date.now(),
          admin: {
            id: 'ADMIN-001',
            username: 'admin',
            role: 'admin',
            user: {
              first_name: 'System',
              last_name: 'Administrator'
            }
          }
        };
      }
      
      // Otherwise use doctor login
      return await authAPI.doctorLogin(credentials);
    }
  },

  // Doctor logout
  doctorLogout: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Doctor Dashboard APIs
export const doctorAPI = {
  // Get dashboard statistics
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/dashboard/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get all patients
  getPatients: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Connect patient to doctor
  connectPatient: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/doctor/connect-patient/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patient_id: patientId })
    });
    return handleResponse(response);
  },

  // Get connection requests
  getConnectionRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/connection-requests/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Accept/reject connection request
  handleConnectionRequest: async (requestId: string, action: 'accept' | 'reject') => {
    const response = await fetch(`${API_BASE_URL}/doctor/connection-requests/${requestId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action })
    });
    return handleResponse(response);
  },

  // Get medical records
  getMedicalRecords: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/medical-records/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create medical record
  createMedicalRecord: async (recordData: any) => {
    const response = await fetch(`${API_BASE_URL}/doctor/medical-records/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    return handleResponse(response);
  },

  // Delete medical record
  deleteMedicalRecord: async (recordId: number) => {
    const response = await fetch(`${API_BASE_URL}/doctor/medical-records/${recordId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get medicines
  getMedicines: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/medicines/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Add medicine
  addMedicine: async (medicineData: any) => {
    const response = await fetch(`${API_BASE_URL}/doctor/medicines/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(medicineData)
    });
    return handleResponse(response);
  },

  // Get prescriptions
  getPrescriptions: async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/prescriptions/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create prescription
  createPrescription: async (prescriptionData: any) => {
    const response = await fetch(`${API_BASE_URL}/doctor/prescriptions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prescriptionData)
    });
    return handleResponse(response);
  },

  // Upload medical document
  uploadDocument: async (formData: FormData) => {
    const token = localStorage.getItem('doctorToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/doctor/upload-document/`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Token ${token}` })
      },
      body: formData
    });
    return handleResponse(response);
  }
};

// Patient APIs
export const patientAPI = {
  // Get all patients
  getAll: async () => {
    try {
      // First try to get from API
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        headers: getAuthHeaders()
      });
      const apiPatients = await handleResponse(response);
      
      // Also get locally registered patients
      const localPatients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
      
      // Combine and deduplicate
      const allPatients = [...apiPatients, ...localPatients];
      const uniquePatients = allPatients.filter((patient, index, self) => 
        index === self.findIndex(p => p.patient_id === patient.patient_id || p.id === patient.id)
      );
      
      return uniquePatients;
    } catch (error) {
      // If API fails, return local patients
      console.log('API failed, using local patients:', error);
      return JSON.parse(localStorage.getItem('registeredPatients') || '[]');
    }
  },

  // Search patient by patient_id
  searchByPatientId: async (patientId: string) => {
    try {
      // First try API
      const response = await fetch(`${API_BASE_URL}/patients/search/?patient_id=${patientId}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      // If API fails, search locally
      console.log('API search failed, searching locally:', error);
      const localPatients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
      const mockPatients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
      
      // Search in both local and mock data
      const allPatients = [...localPatients, ...mockPatients];
      const found = allPatients.find(p => 
        p.patient_id === patientId || 
        p.id === patientId ||
        p.patient_id?.toLowerCase() === patientId.toLowerCase()
      );
      
      if (found) {
        return found;
      } else {
        throw new Error('Patient not found');
      }
    }
  },

  // Create new patient
  create: async (patientData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData)
      });
      const newPatient = await handleResponse(response);
      
      // Also store locally for immediate access
      const localPatients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
      localPatients.push(newPatient);
      localStorage.setItem('registeredPatients', JSON.stringify(localPatients));
      
      return newPatient;
    } catch (error) {
      // If API fails, create locally with generated ID
      console.log('API failed, creating patient locally:', error);
      const localPatients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
      const patientId = `PAT${String(localPatients.length + 1).padStart(5, '0')}`;
      
      const newPatient = {
        ...patientData,
        id: Date.now(),
        patient_id: patientId,
        created_at: new Date().toISOString(),
        qr_code_url: null
      };
      
      localPatients.push(newPatient);
      localStorage.setItem('registeredPatients', JSON.stringify(localPatients));
      
      return newPatient;
    }
  },

  // Patient Authentication
  signup: async (signupData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    return handleResponse(response);
  },

  login: async (credentials: { patient_id: string; password: string }) => {
    try {
      // First, search for the patient to get their email
      const patientResponse = await fetch(`${API_BASE_URL}/patients/search/?patient_id=${credentials.patient_id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!patientResponse.ok) {
        throw new Error('Patient not found');
      }
      
      const patient = await patientResponse.json();
      
      if (!patient.email) {
        throw new Error('Patient email not found');
      }
      
      // Then login with email and password
      const loginResponse = await fetch(`${API_BASE_URL}/auth/patient/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patient.email,
          password: credentials.password
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (!loginResponse.ok) {
        throw new Error(loginResult.error || 'Login failed');
      }
      
      return loginResult;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/profile/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update patient profile
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/profile/update/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  // Request doctor assignment
  requestDoctor: async (doctorId: number) => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/assign-doctor/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ doctor_id: doctorId })
    });
    return handleResponse(response);
  },

  // Get available doctors
  getAvailableDoctors: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/doctors/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Connect to doctor by patient ID
  connectToDoctor: async (patientId: string, doctorId: string) => {
    const response = await fetch(`${API_BASE_URL}/patients/connect-doctor/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId })
    });
    return handleResponse(response);
  },

  // Get patient's assigned doctors
  getMyDoctors: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/my-doctors/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// QR Code Management APIs
export const qrAPI = {
  // Get patient QR code
  getPatientQR: async (patientId: number) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/qr_code/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Generate QR code for patient
  generateQR: async (patientId: number) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/regenerate_qr/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient's own QR code (authenticated)
  getMyQR: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/qr-code/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Regenerate patient's own QR code
  regenerateMyQR: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/regenerate-qr/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Medical Records APIs
export const medicalRecordAPI = {
  // Get all medical records
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/medical-records/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get medical records for specific patient
  getByPatient: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/medical-records/?patient_id=${patientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient's own medical history (authenticated)
  getMyHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/medical-history/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create medical record
  create: async (recordData: any) => {
    const response = await fetch(`${API_BASE_URL}/medical-records/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    return handleResponse(response);
  },

  // Get disease statistics
  getDiseaseStats: async () => {
    const response = await fetch(`${API_BASE_URL}/medical-records/disease_stats/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Analyze PDF report
  analyzePDF: async (formData: FormData) => {
    const token = localStorage.getItem('doctorToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/reports/upload/`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Token ${token}` })
      },
      body: formData
    });
    return handleResponse(response);
  }
};

// AI-Powered APIs
export const aiAPI = {
  // Get outbreak predictions
  getOutbreakPrediction: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/outbreak-prediction/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get disease recommendations
  getRecommendations: async (disease: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations/?disease=${disease}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get patient risk assessment
  getRiskAssessment: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/risk-assessment/?patient_id=${patientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get health alerts
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/alerts/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Export default API object
export default {
  auth: authAPI,
  doctor: doctorAPI,
  patient: patientAPI,
  patients: patientAPI, // Alias for backward compatibility
  qr: qrAPI,
  medicalRecord: medicalRecordAPI,
  ai: aiAPI
};