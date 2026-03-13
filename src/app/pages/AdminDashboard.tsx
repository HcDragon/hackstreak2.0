import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  BarChart3, 
  Users, 
  Activity, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  Shield,
  Database,
  Settings,
  FileText,
  Calendar,
  Stethoscope,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import API from "../../services/api";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [patients, setPatients] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const userType = localStorage.getItem('userType');
        if (userType !== 'admin') {
          window.location.href = '/login';
          return;
        }

        // Load all data for admin dashboard
        const [patientsData, recordsData, diseaseData] = await Promise.all([
          API.patient.getAll(),
          API.doctor.getMedicalRecords(),
          API.medicalRecords.getDiseaseStats()
        ]);

        setPatients(patientsData);
        setMedicalRecords(recordsData);
        setDiseaseStats(diseaseData);

        // Calculate dashboard statistics
        const stats = {
          totalPatients: patientsData.length,
          totalRecords: recordsData.length,
          totalDiseases: diseaseData.length,
          totalDoctors: 5, // Mock data
          criticalCases: recordsData.filter((r: any) => r.is_critical).length,
          todayRecords: recordsData.filter((r: any) => {
            const today = new Date().toISOString().split('T')[0];
            return r.visit_date === today;
          }).length
        };
        setDashboardStats(stats);

      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Failed to load admin dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0a1628] text-white items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "patients", label: "Patients", icon: Users },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "doctors", label: "Doctors", icon: Stethoscope },
    { id: "system", label: "System", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Sora']">Admin Dashboard</h1>
              <p className="text-white/60 text-sm">System administration and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold">{dashboardStats.totalPatients || 0}</span>
            </div>
            <h3 className="font-semibold">Total Patients</h3>
            <p className="text-white/60 text-sm">Registered in system</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold">{dashboardStats.totalRecords || 0}</span>
            </div>
            <h3 className="font-semibold">Medical Records</h3>
            <p className="text-white/60 text-sm">Total records created</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Stethoscope className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold">{dashboardStats.totalDoctors || 0}</span>
            </div>
            <h3 className="font-semibold">Active Doctors</h3>
            <p className="text-white/60 text-sm">Registered doctors</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-2xl font-bold">{dashboardStats.criticalCases || 0}</span>
            </div>
            <h3 className="font-semibold">Critical Cases</h3>
            <p className="text-white/60 text-sm">Require attention</p>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
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
            {activeTab === "analytics" && <AnalyticsTab diseaseStats={diseaseStats} records={medicalRecords} />}
            {activeTab === "patients" && <PatientsTab patients={patients} />}
            {activeTab === "records" && <RecordsTab records={medicalRecords} />}
            {activeTab === "doctors" && <DoctorsTab />}
            {activeTab === "system" && <SystemTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tab Components
function AnalyticsTab({ diseaseStats, records }: { diseaseStats: any[]; records: any[] }) {
  // Process data for charts
  const topDiseases = diseaseStats.slice(0, 10);
  const locationStats = records.reduce((acc: any, record: any) => {
    const location = record.patient_location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Disease Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
            Top Diseases
          </h3>
          <div className="space-y-4">
            {topDiseases.map((disease, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{disease.disease}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-[#00d4ff] h-2 rounded-full"
                      style={{ width: `${(disease.count / topDiseases[0]?.count) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8">{disease.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Cases by Location
          </h3>
          <div className="space-y-4">
            {Object.entries(locationStats).slice(0, 8).map(([location, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{location}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${(count as number / Math.max(...Object.values(locationStats) as number[])) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" />
          Recent System Activity
        </h3>
        <div className="space-y-4">
          {records.slice(0, 10).map((record, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-[#00d4ff] rounded-full"></div>
                <div>
                  <p className="font-medium">New medical record created</p>
                  <p className="text-white/60 text-sm">
                    Patient: {record.patient_name} • Disease: {record.disease}
                  </p>
                </div>
              </div>
              <span className="text-white/60 text-sm">{record.visit_date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientsTab({ patients }: { patients: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Patient Management</h3>
        <button className="flex items-center gap-2 bg-[#00d4ff] text-[#0a1628] px-4 py-2 rounded-xl font-medium hover:bg-[#00b8e6] transition-colors">
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-[#00d4ff] outline-none"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-medium text-white/70">Patient ID</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Name</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Age</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Location</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Blood Group</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 font-mono text-[#00d4ff]">{patient.patient_id}</td>
                <td className="py-3 px-4 font-medium">{patient.name}</td>
                <td className="py-3 px-4">{patient.age}</td>
                <td className="py-3 px-4">{patient.location}</td>
                <td className="py-3 px-4 text-red-400 font-bold">{patient.blood_group}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordsTab({ records }: { records: any[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6">Medical Records Overview</h3>
      
      <div className="space-y-4">
        {records.slice(0, 20).map((record, index) => (
          <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h4 className="font-semibold text-[#00d4ff]">{record.disease}</h4>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">{record.visit_date}</span>
                </div>
                <p className="text-white/70 text-sm mb-1">
                  Patient: {record.patient_name} • Doctor: {record.doctor_name}
                </p>
                <p className="text-white/60 text-sm">{record.symptoms}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorsTab() {
  const mockDoctors = [
    { id: 1, name: "Dr. John Smith", specialization: "General Medicine", patients: 45, status: "Active" },
    { id: 2, name: "Dr. Sarah Johnson", specialization: "Cardiology", patients: 32, status: "Active" },
    { id: 3, name: "Dr. Michael Brown", specialization: "Pediatrics", patients: 28, status: "Active" },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Doctor Management</h3>
        <button className="flex items-center gap-2 bg-[#00d4ff] text-[#0a1628] px-4 py-2 rounded-xl font-medium hover:bg-[#00b8e6] transition-colors">
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-medium text-white/70">Name</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Specialization</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Patients</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Status</th>
              <th className="text-left py-3 px-4 font-medium text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockDoctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 font-medium">{doctor.name}</td>
                <td className="py-3 px-4">{doctor.specialization}</td>
                <td className="py-3 px-4">{doctor.patients}</td>
                <td className="py-3 px-4">
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                    {doctor.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00d4ff]" />
            Database Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Database Connection</span>
              <span className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Storage Used</span>
              <span>2.4 GB / 10 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Backup</span>
              <span>2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            System Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              User Management
            </button>
            <button className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              Security Settings
            </button>
            <button className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              Backup Configuration
            </button>
            <button className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}