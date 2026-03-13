import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  Pill, 
  FileUp, 
  Search, 
  Filter, 
  QrCode, 
  X, 
  Check, 
  Clock, 
  UploadCloud,
  ChevronRight,
  Activity,
  Plus,
  Stethoscope,
  Trash2,
  FileText,
  AlertCircle,
  ScanLine,
  ClipboardList,
  CalendarX2,
  UserPlus
} from "lucide-react";
import { patients, doctors, cities, diseaseNames } from "../../data";
import { SharedHeader } from "../components/SharedHeader";
import { Skeleton } from "../components/Skeleton";
import { DoctorConnectionManager } from "../components/PatientDoctorConnection";
import { PatientSearch } from "../components/PatientSearch";
import { PatientDataManager } from "../../utils/patientDataManager";
import API from "../../services/api";

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("patients");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dynamically load logged in doctor
  const [doctor, setDoctor] = useState(() => {
    const allDoctors = JSON.parse(localStorage.getItem('registeredDoctors') || 'null') || doctors;
    const currentId = localStorage.getItem('currentUserId');
    if (currentId) {
      const found = allDoctors.find((d: any) => d.id === currentId);
      if (found) return found;
    }
    return doctors[0]; // fallback
  });

  const navItems = [
    { id: "patients", label: "Patients", icon: Users },
    { id: "connections", label: "Patient Connections", icon: UserPlus },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "emergency", label: "Emergencies", icon: AlertCircle },
    { id: "teleconsult", label: "Teleconsult", icon: Activity },
    { id: "prescribe", label: "Prescribe", icon: Pill },
    { id: "upload", label: "Upload Report", icon: FileUp },
  ];

  return (
    <div className="flex h-screen bg-[#0a1628] text-white font-['DM_Sans'] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a1628] border-r border-white/10 flex flex-col flex-shrink-0 relative z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#00d4ff]/10 rounded-lg flex items-center justify-center border border-[#00d4ff]/20">
              <Stethoscope className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <h1 className="text-xl font-bold font-['Sora'] tracking-tight">
              Doc<span className="text-[#00d4ff]">Portal</span>
            </h1>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
            </div>
            <h2 className="font-['Sora'] font-semibold text-lg leading-tight">{doctor.name}</h2>
            <p className="text-[#00d4ff] text-xs font-medium mt-1">{doctor.specialization}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive ? "text-[#0a1628] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="docSidebarActive"
                    className="absolute inset-0 bg-[#00d4ff] rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#0a1628]' : 'group-hover:text-[#00d4ff] transition-colors'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button onClick={() => window.location.href = '/login'} className="w-full py-2 text-sm text-white/40 hover:text-red-400 transition-colors">
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#0f1f35]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "patients" && <PatientsTab />}
              {activeTab === "connections" && <ConnectionsTab doctor={doctor} />}
              {activeTab === "appointments" && <AppointmentsTab />}
              {activeTab === "emergency" && <EmergencyTab doctor={doctor} />}
              {activeTab === "teleconsult" && <TeleconsultTab doctor={doctor} />}
              {activeTab === "prescribe" && <PrescribeTab doctor={doctor} />}
              {activeTab === "upload" && <UploadTab doctor={doctor} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- TAB COMPONENTS --- //

function ConnectionsTab({ doctor }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-['Sora'] font-semibold mb-2">Patient Connection Management</h2>
        <p className="text-white/50 text-sm">Manage patient connection requests and search for patients to connect.</p>
      </div>
      
      {/* Patient Search */}
      <PatientSearch 
        showConnectButton={true} 
        doctorId={doctor.id}
        onPatientFound={(patient) => {
          console.log('Patient found:', patient);
        }}
      />
      
      {/* Connection Management */}
      <DoctorConnectionManager doctorId={doctor.id} />
    </div>
  );
}

function PatientsTab() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showQRInput, setShowQRInput] = useState(false);
  const [qrScanId, setQrScanId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  useEffect(() => {
    loadAllPatients();
  }, []);

  const loadAllPatients = async () => {
    setIsLoading(true);
    try {
      // Use PatientDataManager to get all patients from all sources
      const patientsData = PatientDataManager.getAllPatients();
      const patientsArray = Array.isArray(patientsData) ? patientsData : (patientsData ? [patientsData] : []);
      setAllPatients(patientsArray);
      
      // Also try to get from API and merge
      try {
        const apiPatients = await API.patient.getAll();
        const apiArray = Array.isArray(apiPatients) ? apiPatients : (apiPatients ? [apiPatients] : []);
        const combined = [...patientsArray, ...apiArray];
        const unique = combined.filter((patient, index, self) => 
          index === self.findIndex(p => p.patient_id === patient.patient_id)
        );
        setAllPatients(unique);
      } catch (apiError) {
        console.log('API not available, using local data only');
      }
      
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to mock data
      const patientsArray = Array.isArray(patients) ? patients : (patients ? [patients] : []);
      setAllPatients(patientsArray);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use PatientDataManager to find patient
      const found = PatientDataManager.findPatientById(qrScanId.trim());
      if (found) {
        setSelectedPatient(found);
        setShowQRInput(false);
        setQrScanId("");
        toast.success("Patient found via QR scan.");
      } else {
        // Fallback to API search
        const apiFound = await API.patient.searchByPatientId(qrScanId.trim());
        setSelectedPatient(apiFound);
        setShowQRInput(false);
        setQrScanId("");
        toast.success("Patient found via QR scan.");
      }
    } catch (error) {
      toast.error("Patient not found with this ID.");
    }
  };

  const filteredPatients = allPatients.filter(p => {
    const patientName = p.name || '';
    const patientCity = p.city || p.location || '';
    const patientDiseases = p.diseases || [];
    
    const matchesSearch = patientName.toLowerCase().includes(search.toLowerCase()) || 
                         patientCity.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter ? patientCity === cityFilter : true;
    const matchesDisease = diseaseFilter ? patientDiseases.some((d: any) => d.name === diseaseFilter) : true;
    return matchesSearch && matchesCity && matchesDisease;
  });

  const getCondition = (patient: any) => {
    // For newly registered patients, default to 'Active'
    if (!patient.id || typeof patient.id === 'number') {
      return { label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    
    const id = patient.id || patient.patient_id || '';
    const num = parseInt(id.split('-')[1] || id.replace(/\D/g, '')) || 1;
    if (num % 5 === 0) return { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (num % 2 === 0) return { label: 'Recovering', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-['Sora'] font-bold">Patient Directory</h2>
          <p className="text-white/50 text-sm mt-1">Search, filter, and access medical records.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search name or city..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
            />
          </div>
          
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#00d4ff] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
          </select>

          <select 
            value={diseaseFilter}
            onChange={(e) => setDiseaseFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#00d4ff] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Diseases</option>
            {diseaseNames.map(d => <option key={d} value={d} className="bg-[#0a1628]">{d}</option>)}
          </select>

          <div className="relative">
            <button 
              onClick={() => setShowQRInput(true)}
              className="flex items-center gap-2 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-[#00d4ff]/30"
            >
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPatients.filter(p => p && p.name).map(p => {
                const condition = getCondition(p);
                const patientId = p.patient_id || p.id;
                const patientCity = p.city || p.location || 'N/A';
                const patientBloodGroup = p.blood_group || p.bloodGroup || 'N/A';
                
                return (
                  <div 
                    key={patientId} 
                    onClick={() => setSelectedPatient(p)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-[#00d4ff]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0a1628] border border-white/10 rounded-full flex items-center justify-center text-lg font-bold text-[#00d4ff]">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-['Sora'] font-semibold text-lg leading-tight group-hover:text-[#00d4ff] transition-colors">{p.name}</h3>
                          <p className="text-xs text-white/50">{patientId}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-bold ${condition.color}`}>
                        {condition.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="block text-[10px] text-white/40 uppercase mb-0.5">Age/Gender</span>
                        <span className="font-medium">{p.age || 'N/A'} / {p.gender?.charAt(0) || 'N'}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <span className="block text-[10px] text-white/40 uppercase mb-0.5">Blood Group</span>
                        <span className="font-medium text-red-400">{patientBloodGroup}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 col-span-2 flex justify-between items-center">
                        <div>
                          <span className="block text-[10px] text-white/40 uppercase mb-0.5">City</span>
                          <span className="font-medium">{patientCity}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredPatients.length === 0 && (
              <div className="text-center py-20 text-white/40 flex flex-col items-center justify-center">
                <ClipboardList className="w-16 h-16 opacity-20 mb-4" />
                <p>No patients found matching the criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Scan Modal */}
      <AnimatePresence>
        {showQRInput && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a1628] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowQRInput(false)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-['Sora'] font-bold text-xl flex items-center justify-center gap-2">
                  <ScanLine className="w-5 h-5 text-[#00d4ff]" /> Scan Patient QR
                </h3>
                <p className="text-sm text-white/50 mt-1">Position the QR code within the frame</p>
              </div>

              <div className="relative w-full aspect-square bg-[#0f1f35] rounded-2xl border-2 border-white/10 mb-6 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-8 border-2 border-[#00d4ff]/30 rounded-xl">
                  {/* Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00d4ff] rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00d4ff] rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00d4ff] rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00d4ff] rounded-br-lg"></div>
                  
                  {/* Scanning Line */}
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute left-0 w-full h-1 bg-[#00d4ff] shadow-[0_0_15px_#00d4ff] z-10 opacity-70"
                  />
                </div>
                <QrCode className="w-16 h-16 text-white/10" />
              </div>

              <div className="text-center">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Or enter Patient ID manually</p>
                <form onSubmit={handleQRScan} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter PAT-XXXX" 
                    value={qrScanId}
                    onChange={(e) => setQrScanId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none text-center font-mono tracking-widest"
                    autoFocus
                  />
                  <button type="submit" className="bg-[#00d4ff] text-[#0a1628] px-6 rounded-xl font-bold hover:bg-[#00b8e6] transition-colors">Go</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side Panel for Patient Detail */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a1628] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="sticky top-0 bg-[#0a1628]/90 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center z-10">
                <h3 className="font-['Sora'] font-bold text-xl">Patient Profile</h3>
                <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-['Sora'] font-bold">{selectedPatient.name}</h2>
                    <p className="text-[#00d4ff] font-mono text-sm">{selectedPatient.patient_id || selectedPatient.id}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                      <span>{selectedPatient.age} yrs</span> • 
                      <span>{selectedPatient.gender}</span> • 
                      <span className="text-red-400 font-bold">{selectedPatient.blood_group || selectedPatient.bloodGroup}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Phone</span>
                    <span className="text-sm">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Emergency</span>
                    <span className="text-sm">{selectedPatient.emergencyContact || selectedPatient.emergency_contact || 'N/A'}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 col-span-2">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">City</span>
                    <span className="text-sm">{selectedPatient.city || selectedPatient.location || 'N/A'}</span>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h4 className="font-['Sora'] font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-[#00d4ff]"/> Medical History</h4>
                  <div className="space-y-4 border-l border-white/10 ml-2 pl-4">
                    {selectedPatient.diseases?.length ? selectedPatient.diseases.map((d: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#00d4ff]" />
                        <h5 className="font-semibold text-sm text-[#00d4ff]">{d.name} <span className="text-xs text-white/40 font-normal bg-white/5 px-2 py-0.5 rounded ml-2">{d.year}</span></h5>
                        <p className="text-xs text-white/60 mt-1">{d.hospital}</p>
                        <p className="text-xs text-white/50 mt-0.5 italic">Tx: {d.treatment}</p>
                      </div>
                    )) : <p className="text-xs text-white/40">No recorded history.</p>}
                  </div>
                </div>

                {/* Prescriptions */}
                <div>
                  <h4 className="font-['Sora'] font-semibold mb-4 flex items-center gap-2"><Pill className="w-4 h-4 text-green-400"/> Recent Prescriptions</h4>
                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden p-4">
                    {(() => {
                      const patientId = selectedPatient.patient_id || selectedPatient.id;
                      const localMeds = JSON.parse(localStorage.getItem(`prescriptions_${patientId}`) || '[]');
                      if (localMeds.length > 0) {
                        return localMeds.map((m: any) => (
                          <div key={m.id} className="mb-2 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <p className="text-sm font-semibold">{m.name} <span className="text-xs font-normal text-white/50 ml-1">{m.dosage}</span></p>
                            <p className="text-xs text-white/50">{m.frequency} • {m.duration}</p>
                          </div>
                        ));
                      }
                      return <p className="text-center text-xs text-white/40">No active prescriptions.</p>;
                    })()}
                  </div>
                </div>

                {/* Reports */}
                <div>
                  <h4 className="font-['Sora'] font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-orange-400"/> Uploaded Reports</h4>
                  <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                    {(() => {
                      const patientId = selectedPatient.patient_id || selectedPatient.id;
                      const localReps = JSON.parse(localStorage.getItem(`reports_${patientId}`) || '[]');
                      if (localReps.length > 0) {
                        return localReps.map((r: any) => (
                          <div key={r.id} className="mb-2 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-blue-400">{r.name}</p>
                            <p className="text-xs text-white/50">{r.date} • {r.doctor}</p>
                          </div>
                        ));
                      }
                      return <p className="text-center text-xs text-white/40">No reports available.</p>;
                    })()}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentsTab() {
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'Amit Kumar', reason: 'Dengue Follow-up', time: '09:00 AM', status: 'Booked' },
    { id: 2, patient: 'Sneha Rao', reason: 'General Consultation', time: '11:30 AM', status: 'Booked' },
    { id: 3, patient: 'Pooja Desai', reason: 'Fever Assessment', time: '02:00 PM', status: 'Completed' },
    { id: 4, patient: 'Rahul Menon', reason: 'Report Review', time: '04:00 PM', status: 'Booked' },
  ]);

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

  const handleMarkComplete = (id: number) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'Completed' } : a));
    toast.success("Appointment marked as completed.");
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-8">
      {/* Today's Schedule */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
        <h2 className="text-2xl font-['Sora'] font-bold mb-6">Today's Schedule</h2>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {timeSlots.map((time) => {
            // Find an appointment close to this hour (simplification for UI)
            const apt = appointments.find(a => a.time.includes(time.split(':')[0]));
            
            return (
              <div key={time} className="flex gap-4 items-stretch group">
                <div className="w-20 text-right text-xs text-white/50 font-medium py-4">{time}</div>
                <div className="w-4 flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${apt ? (apt.status === 'Completed' ? 'bg-green-500 border-green-500' : 'bg-[#00d4ff] border-[#00d4ff]') : 'bg-transparent border-white/20'}`} />
                  <div className="w-px h-full bg-white/10 group-last:hidden" />
                </div>
                <div className="flex-1 pb-4">
                  {apt ? (
                    <div className={`p-4 rounded-2xl border ${apt.status === 'Completed' ? 'bg-green-500/5 border-green-500/20' : 'bg-[#00d4ff]/10 border-[#00d4ff]/20'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-semibold ${apt.status === 'Completed' ? 'text-green-400' : 'text-white'}`}>{apt.patient}</h4>
                          <p className="text-sm text-white/60 mt-0.5">{apt.reason}</p>
                        </div>
                        {apt.status !== 'Completed' && (
                          <button 
                            onClick={() => handleMarkComplete(apt.id)}
                            className="text-xs flex items-center gap-1 bg-[#00d4ff]/20 hover:bg-[#00d4ff]/30 text-[#00d4ff] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Check className="w-3 h-3" /> Complete
                          </button>
                        )}
                        {apt.status === 'Completed' && (
                          <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded flex items-center gap-1"><Check className="w-3 h-3"/> Done</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-white/10 text-white/30 text-sm flex items-center h-full">
                      Available Slot
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming This Week */}
      <div className="w-full xl:w-96 bg-[#0f1f35] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col">
        <h2 className="text-xl font-['Sora'] font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#00d4ff]" /> Upcoming This Week
        </h2>
        
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/70 font-medium">Tomorrow</span>
                <span className="text-xs text-[#00d4ff] font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> 10:30 AM</span>
              </div>
              <h4 className="font-semibold text-white">Sanjay Joshi</h4>
              <p className="text-xs text-white/50 mt-1">Routine checkup</p>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
          View All Calendar
        </button>
      </div>
    </div>
  );
}

function PrescribeTab({ doctor }: any) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [medicines, setMedicines] = useState<any[]>([]);
  
  // Recent prescriptions mock
  const [recent, setRecent] = useState([
    { id: 1, patient: 'Amit Kumar', date: 'Today', meds: 2 },
    { id: 2, patient: 'Sneha Rao', date: 'Yesterday', meds: 1 },
  ]);

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string }; dosage: { value: string }; frequency: { value: string }; duration: { value: string };
    };
    
    if(!target.name.value) return;

    setMedicines([...medicines, {
      id: Date.now(),
      name: target.name.value,
      dosage: target.dosage.value,
      frequency: target.frequency.value,
      duration: target.duration.value
    }]);
    
    (e.target as HTMLFormElement).reset();
  };

  const handleRemoveMed = (id: number) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleSubmitPrescription = () => {
    if (!selectedPatientId || medicines.length === 0) {
      toast.error("Please select a patient and add at least one medicine.");
      return;
    }
    const patName = patients.find(p => p.id === selectedPatientId)?.name || 'Unknown';
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem(`prescriptions_${selectedPatientId}`) || '[]');
    const newMeds = medicines.map(m => ({...m, date: new Date().toLocaleDateString()}));
    localStorage.setItem(`prescriptions_${selectedPatientId}`, JSON.stringify([...existing, ...newMeds]));

    toast.success(`Prescription sent to ${patName}`);
    setRecent([{ id: Date.now(), patient: patName, date: 'Just now', meds: medicines.length }, ...recent]);
    setMedicines([]);
    setSelectedPatientId("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-['Sora'] font-bold">Prescribe Medicine</h2>
        <p className="text-white/50 text-sm mt-1">Create and send digital prescriptions to patients.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">Select Patient</label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 focus:border-[#00d4ff] outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>Search or select assigned patient...</option>
            {doctor.assignedPatients.map((id: string) => {
              const p = patients.find(pat => pat.id === id);
              return p ? <option key={id} value={id}>{p.name} ({id})</option> : null;
            })}
          </select>
        </div>

        {/* Medicine Input Form */}
        <form onSubmit={handleAddMedicine} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl mb-6">
          <h4 className="text-sm font-semibold mb-4 text-[#00d4ff]">Add Medicine Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Medicine Name</label>
              <input required name="name" type="text" placeholder="e.g. Paracetamol" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Dosage</label>
              <input required name="dosage" type="text" placeholder="e.g. 500mg" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Frequency</label>
              <select required name="frequency" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none appearance-none">
                <option value="Once daily">Once daily (OD)</option>
                <option value="Twice daily">Twice daily (BID)</option>
                <option value="Thrice daily">Thrice daily (TID)</option>
                <option value="As needed">As needed (SOS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Duration</label>
              <input required name="duration" type="text" placeholder="e.g. 5 Days" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4ff] outline-none" />
            </div>
          </div>
          <button type="submit" className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        </form>

        {/* Added Medicines List */}
        {medicines.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-sm font-semibold text-white/80">Prescription List:</h4>
            {medicines.map(med => (
              <div key={med.id} className="flex items-center justify-between bg-white/[0.05] border border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-[#00d4ff]/10 p-2 rounded-lg"><Pill className="w-5 h-5 text-[#00d4ff]"/></div>
                  <div>
                    <h5 className="font-semibold text-sm">{med.name} <span className="text-white/50 font-normal ml-2">{med.dosage}</span></h5>
                    <p className="text-xs text-white/60">{med.frequency} • {med.duration}</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveMed(med.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <label className="block text-xs text-white/50 mb-2">Special Instructions / Notes (Optional)</label>
              <textarea rows={2} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none" placeholder="Take after meals..."></textarea>
            </div>
          </div>
        )}

        <button 
          onClick={handleSubmitPrescription}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${medicines.length > 0 && selectedPatientId ? 'bg-[#00d4ff] text-[#0a1628] hover:bg-[#00b8e6] shadow-[0_0_20px_rgba(0,212,255,0.3)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
        >
          Send Prescription
        </button>
      </div>

      {/* Recent */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
        <h3 className="font-['Sora'] font-semibold mb-4">Recent Prescriptions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Medicines</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.map((r, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-[#00d4ff]">{r.patient}</td>
                  <td className="py-3 text-white/70">{r.date}</td>
                  <td className="py-3 text-white/70">{r.meds} prescribed</td>
                  <td className="py-3 text-right">
                    <button className="text-xs border border-white/20 px-3 py-1.5 rounded hover:bg-white/10">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UploadTab({ doctor }: any) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [fileType, setFileType] = useState("Blood Test");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  useEffect(() => {
    // Load all patients for the dropdown
    const loadPatients = () => {
      const patients = PatientDataManager.getAllPatients();
      setAllPatients(patients);
    };
    loadPatients();
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if(e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast.error('Only PDF files are supported for AI analysis');
      }
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & { title: { value: string } };
    if (!selectedPatientId || !file) {
      toast.error("Please select a patient and attach a file.");
      return;
    }
    
    // Find the selected patient
    const selectedPatient = PatientDataManager.findPatientById(selectedPatientId);
    if (!selectedPatient) {
      toast.error("Selected patient not found.");
      return;
    }
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem(`reports_${selectedPatientId}`) || '[]');
    const newReport = {
      id: Date.now(),
      name: target.title.value || file.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      doctor: doctor.name
    };
    localStorage.setItem(`reports_${selectedPatientId}`, JSON.stringify([...existing, newReport]));

    toast.success(`Report uploaded! ${selectedPatient.name} has been notified.`, {
      style: { background: '#10b981', color: '#fff', border: 'none' }
    });
    setFile(null);
    setSelectedPatientId("");
    (e.target as HTMLFormElement).reset();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-['Sora'] font-bold">Upload Medical Report</h2>
        <p className="text-white/50 text-sm mt-1">Securely attach lab results, scans, and documents to patient records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">Select Patient</label>
                <select 
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 focus:border-[#00d4ff] outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Search patient...</option>
                  {allPatients.map(p => {
                    const patientId = p.patient_id || p.id;
                    return (
                      <option key={patientId} value={patientId}>
                        {p.name} ({patientId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Report Type</label>
                <select 
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 focus:border-[#00d4ff] outline-none appearance-none"
                >
                  {['Blood Test', 'CT Scan', 'MRI', 'X-Ray', 'Urine Analysis', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-white/70 mb-2">Report Title</label>
                <input required name="title" type="text" placeholder="e.g. Dengue NS1 Antigen" className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 focus:border-[#00d4ff] outline-none" />
              </div>
            </div>

            {/* Drag and Drop Area */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Attach Document</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-[#00d4ff] bg-[#00d4ff]/5' : file ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/[0.02] hover:bg-white/5'}`}
              >
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-green-400 mb-3" />
                    <p className="font-semibold text-green-400">{file.name}</p>
                    <p className="text-xs text-white/50 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={() => setFile(null)} className="text-xs text-red-400 mt-4 hover:underline">Remove file</button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#0a1628] rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-lg">
                      <UploadCloud className="w-8 h-8 text-[#00d4ff]" />
                    </div>
                    <p className="font-medium text-white/80">Drag & drop your file here</p>
                    <p className="text-xs text-white/40 mt-2 mb-4">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                    <label className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-white/10 cursor-pointer">
                      Browse Files
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Doctor's Notes (Visible to Patient)</label>
              <textarea rows={3} className="w-full bg-[#0a1628] border border-white/20 rounded-xl px-4 py-3 focus:border-[#00d4ff] outline-none" placeholder="Please review the highlighted parameters..."></textarea>
            </div>

            <button 
              type="submit" 
              disabled={!file || !selectedPatientId}
              className={`w-full py-4 font-bold rounded-xl transition-all ${
                file && selectedPatientId
                  ? 'bg-[#00d4ff] text-[#0a1628] hover:bg-[#00b8e6] shadow-[0_0_20px_rgba(0,212,255,0.2)]' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Upload & Notify Patient
            </button>
          </form>
        </div>

        {/* Recent Uploads Sidebar */}
        <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-6">
          <h3 className="font-['Sora'] font-semibold mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-[#00d4ff]"/> Recent Uploads</h3>
          <div className="space-y-4">
            {[
              { n: 'Amit Kumar', t: 'CBC Report', d: 'Oct 12' },
              { n: 'Pooja Desai', t: 'X-Ray Chest', d: 'Oct 10' },
              { n: 'Rahul Menon', t: 'Lipid Profile', d: 'Oct 08' }
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-4 h-4 text-blue-400"/></div>
                  <div>
                    <h5 className="font-semibold text-sm">{u.n}</h5>
                    <p className="text-[10px] text-white/50">{u.t} • {u.d}</p>
                  </div>
                </div>
                <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- NEW TABS: Emergency & Teleconsult --- //

function EmergencyTab({ doctor }: any) {
  const [emergencies, setEmergencies] = useState<any[]>([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('activeEmergencies') || '[]');
    // Filter for this specific doctor if strictly needed, but for emergencies usually you see all or assigned
    const docsEm = all.filter((e: any) => e.doctorId === doctor.id || e.doctorId === 'DOC-001');
    setEmergencies(docsEm);
  }, [doctor.id]);

  const resolveEmergency = (id: number) => {
    const all = JSON.parse(localStorage.getItem('activeEmergencies') || '[]');
    const updated = all.filter((e: any) => e.id !== id);
    localStorage.setItem('activeEmergencies', JSON.stringify(updated));
    setEmergencies(updated.filter((e: any) => e.doctorId === doctor.id || e.doctorId === 'DOC-001'));
    toast.success("Emergency resolved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-['Sora'] font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="text-red-500 w-6 h-6" /> Emergency Alerts
        </h2>
        <p className="text-white/50 text-sm">Patients requiring immediate assistance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {emergencies.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white/80">No active emergencies</h3>
            <p className="text-sm text-white/50">All patients are stable.</p>
          </div>
        ) : (
          emergencies.map((e, idx) => (
            <div key={idx} className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-red-500 animate-pulse" />
              <div>
                <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3 inline-block">Critical</span>
                <h3 className="text-xl font-bold text-red-100">{e.patientName}</h3>
                <p className="text-white/60 text-sm mt-1">Patient ID: {e.patientId} • Triggered at: {e.timestamp}</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-colors">
                  Join Teleconsult
                </button>
                <button onClick={() => resolveEmergency(e.id)} className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors">
                  Mark Resolved
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TeleconsultTab({ doctor }: any) {
  const [symptoms, setSymptoms] = useState("");
  
  const handlePrescribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Prescription generated & sent based on symptoms!");
    (e.target as HTMLFormElement).reset();
    setSymptoms("");
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-['Sora'] font-semibold mb-2">Teleconsultation Room</h2>
        <p className="text-white/50 text-sm">Conduct secure video calls and prescribe instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Video Call Mock Area */}
        <div className="lg:col-span-2 bg-[#0a1628] border border-white/10 rounded-3xl overflow-hidden relative shadow-xl flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="flex-1 relative flex items-center justify-center bg-black/40">
            {/* Mock Patient Cam */}
            <div className="w-full h-full object-cover opacity-50 relative">
               <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" alt="Patient Video" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
            
            {/* Mock Doctor Cam PiP */}
            <div className="absolute bottom-6 right-6 w-32 md:w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl">
               <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400" alt="Doctor Video" className="w-full h-full object-cover opacity-80" />
            </div>
            
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium">04:23 • Live Encrypted</span>
            </div>
          </div>
          
          {/* Call Controls */}
          <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-center gap-4">
            <button className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><div className="w-5 h-5 bg-white rounded-sm" /></button>
            <button className="p-4 bg-red-500 hover:bg-red-400 text-white rounded-full transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"><X className="w-6 h-6" /></button>
            <button className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><Activity className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Symptoms & Prescription Side */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col shadow-xl overflow-y-auto custom-scrollbar">
          <h3 className="font-['Sora'] font-semibold text-lg mb-4">Live Assessment</h3>
          
          <div className="mb-6">
            <label className="block text-xs text-white/50 mb-2">Patient Symptoms Recorded</label>
            <textarea 
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full h-24 bg-[#0a1628] border border-white/10 rounded-xl p-3 text-sm focus:border-blue-400 outline-none resize-none"
              placeholder="E.g. High fever for 3 days, chills, body ache..."
            />
          </div>

          <div className="flex-1 flex flex-col">
            <h4 className="font-medium text-sm mb-3">Quick Prescription</h4>
            <form onSubmit={handlePrescribe} className="space-y-4 flex-1">
              <div>
                <input required type="text" placeholder="Medicine Name" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" placeholder="Dosage (e.g. 500mg)" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none" />
                <select required className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none appearance-none">
                  <option value="" disabled selected>Freq...</option>
                  <option value="1-0-1">1-0-1</option>
                  <option value="1-1-1">1-1-1</option>
                  <option value="0-0-1">0-0-1</option>
                </select>
              </div>
              <div>
                <input required type="text" placeholder="Duration (e.g. 5 days)" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none" />
              </div>
              <button type="submit" className="w-full py-3 mt-auto bg-[#00d4ff] text-[#0a1628] font-bold rounded-xl hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                Send Prescription
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
