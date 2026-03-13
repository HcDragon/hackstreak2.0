import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Search, UserPlus, User, Phone, MapPin, Droplet, Calendar } from 'lucide-react';
import { PatientDataManager } from '../../utils/patientDataManager';
import API from '../../services/api';

interface PatientSearchProps {
  onPatientFound?: (patient: any) => void;
  showConnectButton?: boolean;
  doctorId?: string;
}

export function PatientSearch({ onPatientFound, showConnectButton = false, doctorId }: PatientSearchProps) {
  const [searchId, setSearchId] = useState('');
  const [foundPatient, setFoundPatient] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    try {
      let patient = PatientDataManager.findPatientById(searchId.trim());
      
      if (!patient) {
        patient = await API.patient.searchByPatientId(searchId.trim());
      }
      
      if (patient) {
        setFoundPatient(patient);
        onPatientFound?.(patient);
        toast.success(`Patient found: ${patient.name}`);
      } else {
        throw new Error('Patient not found');
      }
    } catch (error) {
      console.error('Patient search error:', error);
      setFoundPatient(null);
      toast.error('Patient not found with this ID');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async () => {
    if (!foundPatient || !doctorId) return;

    setIsConnecting(true);
    try {
      const existingConnections = JSON.parse(localStorage.getItem(`doctor_patients_${doctorId}`) || '[]');
      const isAlreadyConnected = existingConnections.some((p: any) => p.patientId === foundPatient.patient_id);
      
      if (isAlreadyConnected) {
        toast.error('Patient is already connected');
        return;
      }

      const newConnection = {
        id: foundPatient.patient_id,
        name: foundPatient.name,
        patientId: foundPatient.patient_id,
        connectedAt: new Date().toISOString(),
        connectionType: 'doctor_initiated'
      };

      const updatedConnections = [...existingConnections, newConnection];
      localStorage.setItem(`doctor_patients_${doctorId}`, JSON.stringify(updatedConnections));

      const patientConnections = JSON.parse(localStorage.getItem(`patient_doctors_${foundPatient.patient_id}`) || '[]');
      const doctorConnection = {
        id: doctorId,
        name: 'Dr. Current Doctor',
        specialization: 'General Physician',
        connectedAt: new Date().toISOString(),
        connectionType: 'doctor_initiated'
      };
      localStorage.setItem(`patient_doctors_${foundPatient.patient_id}`, JSON.stringify([...patientConnections, doctorConnection]));

      toast.success(`Successfully connected to patient ${foundPatient.name}`);
      setFoundPatient(null);
      setSearchId('');

    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to patient');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-[#00d4ff]" />
          Search Patient by ID
        </h3>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Patient ID (e.g., PAT00001)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00d4ff] outline-none font-mono tracking-wider"
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchId.trim()}
            className="px-6 py-3 bg-[#00d4ff] text-[#0a1628] rounded-xl font-semibold hover:bg-[#00b8e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {foundPatient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400">Patient Found</h3>
            {showConnectButton && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Patient'}
              </button>
            )}
          </div>

          <div className="bg-white/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {foundPatient.name ? foundPatient.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-400">{foundPatient.name}</h2>
                <p className="text-[#00d4ff] font-mono text-lg">{foundPatient.patient_id}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                  <span>{foundPatient.age} years</span>
                  <span>•</span>
                  <span>{foundPatient.gender}</span>
                  <span>•</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <Droplet className="w-3 h-3" />
                    {foundPatient.blood_group}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs text-white/50 uppercase">Phone</span>
                </div>
                <p className="font-medium">{foundPatient.phone || 'N/A'}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs text-white/50 uppercase">Location</span>
                </div>
                <p className="font-medium">{foundPatient.location || foundPatient.city || 'N/A'}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs text-white/50 uppercase">Registered</span>
                </div>
                <p className="font-medium">{foundPatient.created_at ? new Date(foundPatient.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {foundPatient.medical_records && foundPatient.medical_records.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-white/80">Recent Medical History</h4>
                <div className="space-y-2">
                  {foundPatient.medical_records.slice(0, 3).map((record: any, index: number) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{record.disease}</p>
                          <p className="text-xs text-white/60">{record.visit_date}</p>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {record.doctor_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
