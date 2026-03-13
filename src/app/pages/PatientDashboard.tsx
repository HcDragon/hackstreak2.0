import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Phone, 
  MapPin, 
  Droplet,
  Clock,
  Download,
  Eye,
  QrCode,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
  UserPlus
} from "lucide-react";
import API from "../../services/api";
import { PatientDoctorConnection } from "../components/PatientDoctorConnection";

export function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userType = localStorage.getItem('userType');
        const token = localStorage.getItem('patientToken');
        
        if (userType !== 'patient' || !token) {
          window.location.href = '/login';
          return;
        }

        // Load patient profile using authenticated API
        const patientResponse = await API.patient.getProfile();
        const patientData = patientResponse.patient; // Extract patient from nested response
        setPatient(patientData);

        // Medical records are already included in the profile response
        if (patientData.medical_records) {
          setMedicalRecords(patientData.medical_records);
        }

        // Load prescriptions from localStorage (demo data)
        const localPrescriptions = JSON.parse(localStorage.getItem(`prescriptions_${patientData.patient_id}`) || '[]');
        setPrescriptions(localPrescriptions);

        // Load reports from localStorage (demo data)
        const localReports = JSON.parse(localStorage.getItem(`reports_${patientData.patient_id}`) || '[]');
        setReports(localReports);

      } catch (error) {
        console.error('Error loading patient data:', error);
        toast.error('Failed to load patient data');
        // If token is invalid, redirect to login
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPatientData();
  }, []);

  const handleLogout = async () => {
    try {
      await API.patient.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userType');
      localStorage.removeItem('patientToken');
      window.location.href = '/login';
    }
  };

  const loadQRCode = async () => {
    try {
      if (patient?.id) {
        const qrData = await API.qr.getPatientQR(patient.id);
        return qrData.qr_code_url;
      }
    } catch (error) {
      console.error('Error loading QR code:', error);
      toast.error('Failed to load QR code');
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0a1628] text-white items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-screen bg-[#0a1628] text-white items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white/60">Patient data not found</p>
          <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-[#00d4ff] text-[#0a1628] rounded-lg">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "reports", label: "Reports", icon: Download },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "doctors", label: "My Doctors", icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Sora']">Patient Portal</h1>
              <p className="text-white/60 text-sm">Welcome back, {patient?.name || 'Patient'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
            >
              <QrCode className="w-4 h-4" />
              My QR Code
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Patient Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {patient?.name ? patient.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-['Sora']">{patient?.name || 'Patient'}</h2>
                <p className="text-[#00d4ff] font-mono text-lg">{patient?.patient_id || 'N/A'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                  <span>{patient?.age || 'N/A'} years</span>
                  <span>•</span>
                  <span>{patient?.gender || 'N/A'}</span>
                  <span>•</span>
                  <span className="text-red-400 font-bold">{patient?.blood_group || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs text-white/50 uppercase">Phone</span>
                </div>
                <p className="font-medium">{patient?.phone || 'N/A'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs text-white/50 uppercase">Location</span>
                </div>
                <p className="font-medium">{patient?.location || 'N/A'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-white/50 uppercase">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-[#00d4ff] text-[#0a1628] font-semibold' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <OverviewTab patient={patient} records={medicalRecords} />}
            {activeTab === "records" && <RecordsTab records={medicalRecords} />}
            {activeTab === "prescriptions" && <PrescriptionsTab prescriptions={prescriptions} />}
            {activeTab === "reports" && <ReportsTab reports={reports} />}
            {activeTab === "appointments" && <AppointmentsTab />}
            {activeTab === "doctors" && <DoctorsTab patient={patient} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a1628] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center relative"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold mb-4">Your Health QR Code</h3>
              <QRCodeDisplay patient={patient} />
              <p className="text-sm text-white/60 mb-4">
                Show this QR code to healthcare providers for quick access to your medical information.
              </p>
              <p className="text-xs text-white/40">
                Patient ID: {patient?.patient_id || 'N/A'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tab Components
function OverviewTab({ patient, records }: { patient: any; records: any[] }) {
  const recentRecords = records.slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Health Summary */}
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-6">Health Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              {recentRecords.length > 0 ? (
                recentRecords.map((record, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{record.disease}</p>
                    <p className="text-white/60 text-xs">{record.visit_date}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-sm">No recent medical records</p>
              )}
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              Health Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Health</span>
                <span className="text-green-400 text-sm font-medium">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Checkup</span>
                <span className="text-white/60 text-sm">
                  {records.length > 0 ? records[0].visit_date : 'No records'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Records</span>
              <span className="text-2xl font-bold text-[#00d4ff]">{records.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Active Prescriptions</span>
              <span className="text-2xl font-bold text-green-400">
                {JSON.parse(localStorage.getItem(`prescriptions_${patient?.patient_id}`) || '[]').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Reports</span>
              <span className="text-2xl font-bold text-orange-400">
                {JSON.parse(localStorage.getItem(`reports_${patient?.patient_id}`) || '[]').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordsTab({ records }: { records: any[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Medical Records</h3>
      
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-[#00d4ff]">{record.disease}</h4>
                  <p className="text-white/60 text-sm">{record.visit_date} • Dr. {record.doctor_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm text-white/80 mb-2">Symptoms</h5>
                  <p className="text-sm text-white/70">{record.symptoms}</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm text-white/80 mb-2">Diagnosis</h5>
                  <p className="text-sm text-white/70">{record.diagnosis}</p>
                </div>
                <div className="md:col-span-2">
                  <h5 className="font-medium text-sm text-white/80 mb-2">Prescription</h5>
                  <p className="text-sm text-white/70">{record.prescription}</p>
                </div>
                {record.notes && (
                  <div className="md:col-span-2">
                    <h5 className="font-medium text-sm text-white/80 mb-2">Notes</h5>
                    <p className="text-sm text-white/70">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No medical records found</p>
        </div>
      )}
    </div>
  );
}

function PrescriptionsTab({ prescriptions }: { prescriptions: any[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Active Prescriptions</h3>
      
      {prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((prescription, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#00d4ff]/10 rounded-lg">
                  <Pill className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{prescription.name}</h4>
                  <p className="text-white/60 text-sm">{prescription.dosage}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {prescription.frequency} • {prescription.duration}
                  </p>
                  {prescription.date && (
                    <p className="text-white/40 text-xs mt-1">Prescribed: {prescription.date}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No active prescriptions</p>
        </div>
      )}
    </div>
  );
}

function ReportsTab({ reports }: { reports: any[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Medical Reports</h3>
      
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold">{report.name}</h4>
                  <p className="text-white/60 text-sm">{report.date} • {report.doctor}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-colors">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Download className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No reports available</p>
        </div>
      )}
    </div>
  );
}

function AppointmentsTab() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Upcoming Appointments</h3>
      
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No upcoming appointments</p>
        <button className="mt-4 px-6 py-2 bg-[#00d4ff] text-[#0a1628] rounded-lg font-medium hover:bg-[#00b8e6] transition-colors">
          Book Appointment
        </button>
      </div>
    </div>
  );
}

function DoctorsTab({ patient }: { patient: any }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Doctor Connections</h3>
      <PatientDoctorConnection 
        patientId={patient?.patient_id || patient?.id} 
        onConnectionUpdate={() => {
          // Refresh patient data if needed
          console.log('Connection updated');
        }}
      />
    </div>
  );
}

// QR Code Display Component
function QRCodeDisplay({ patient }: { patient: any }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQRCode = async () => {
      try {
        // First try to use QR code URL from patient data
        if (patient?.qr_code_url) {
          const qrUrl = patient.qr_code_url.startsWith('http') 
            ? patient.qr_code_url 
            : `http://localhost:8000${patient.qr_code_url}`;
          setQrCodeUrl(qrUrl);
          setIsLoading(false);
          return;
        }

        // If not available, fetch from API
        const qrData = await API.qr.getMyQR();
        const qrUrl = qrData.qr_code_url.startsWith('http') 
          ? qrData.qr_code_url 
          : `http://localhost:8000${qrData.qr_code_url}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error loading QR code:', error);
        // Try to generate QR code if it doesn't exist
        try {
          await API.qr.regenerateMyQR();
          const qrData = await API.qr.getMyQR();
          const qrUrl = qrData.qr_code_url.startsWith('http') 
            ? qrData.qr_code_url 
            : `http://localhost:8000${qrData.qr_code_url}`;
          setQrCodeUrl(qrUrl);
        } catch (genError) {
          console.error('Error generating QR code:', genError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (patient) {
      loadQRCode();
    }
  }, [patient]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-2xl mb-4">
        <div className="w-48 h-48 mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl mb-4">
      {qrCodeUrl ? (
        <div>
          <img 
            src={qrCodeUrl} 
            alt="Patient QR Code" 
            className="w-48 h-48 mx-auto rounded-xl"
            onError={(e) => {
              console.error('QR code image failed to load:', qrCodeUrl);
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-48 h-48 mx-auto bg-gray-200 rounded-xl flex-col items-center justify-center text-gray-600 text-sm" style={{display: 'none'}}>
            <QrCode className="w-16 h-16 mb-2" />
            <p>QR Code not available</p>
            <p className="text-xs mt-1">URL: {qrCodeUrl}</p>
          </div>
        </div>
      ) : (
        <div className="w-48 h-48 mx-auto bg-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-600">
          <QrCode className="w-16 h-16 mb-2" />
          <p className="text-sm">QR Code not found</p>
        </div>
      )}
    </div>
  );
}