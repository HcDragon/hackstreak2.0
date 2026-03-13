import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Stethoscope,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import API from '../../services/api';
import { doctors } from '../../data';

interface ConnectionProps {
  patientId: string;
  onConnectionUpdate?: () => void;
}

export function PatientDoctorConnection({ patientId, onConnectionUpdate }: ConnectionProps) {
  const [availableDoctors, setAvailableDoctors] = useState(doctors);
  const [connectedDoctors, setConnectedDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);

  useEffect(() => {
    loadConnectedDoctors();
    loadConnectionRequests();
  }, [patientId]);

  const loadConnectedDoctors = async () => {
    try {
      const connections = JSON.parse(localStorage.getItem(`patient_doctors_${patientId}`) || '[]');
      setConnectedDoctors(connections);
    } catch (error) {
      console.error('Error loading connected doctors:', error);
    }
  };

  const loadConnectionRequests = async () => {
    try {
      const requests = JSON.parse(localStorage.getItem(`connection_requests_${patientId}`) || '[]');
      setConnectionRequests(requests);
    } catch (error) {
      console.error('Error loading connection requests:', error);
    }
  };

  const handleConnectToDoctor = async (doctorId: string) => {
    setIsLoading(true);
    try {
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) return;

      const isConnected = connectedDoctors.some(d => d.id === doctorId);
      if (isConnected) {
        toast.error('Already connected to this doctor');
        return;
      }

      const requestExists = connectionRequests.some(r => r.doctorId === doctorId && r.status === 'pending');
      if (requestExists) {
        toast.error('Connection request already sent');
        return;
      }

      const newRequest = {
        id: Date.now().toString(),
        patientId,
        doctorId,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      const existingRequests = JSON.parse(localStorage.getItem(`connection_requests_${patientId}`) || '[]');
      localStorage.setItem(`connection_requests_${patientId}`, JSON.stringify([...existingRequests, newRequest]));

      const doctorRequests = JSON.parse(localStorage.getItem(`doctor_requests_${doctorId}`) || '[]');
      localStorage.setItem(`doctor_requests_${doctorId}`, JSON.stringify([...doctorRequests, newRequest]));

      setConnectionRequests([...connectionRequests, newRequest]);
      toast.success(`Connection request sent to ${doctor.name}`);
      onConnectionUpdate?.();

    } catch (error) {
      console.error('Error connecting to doctor:', error);
      toast.error('Failed to send connection request');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = availableDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {connectedDoctors.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Connected Doctors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white/5 border border-green-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400">{doctor.name}</h4>
                    <p className="text-sm text-white/60">{doctor.specialization}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {connectionRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Pending Requests
          </h3>
          <div className="space-y-3">
            {connectionRequests
              .filter(r => r.status === 'pending')
              .map(request => (
                <div key={request.id} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{request.doctorName}</h4>
                      <p className="text-sm text-white/60">{request.specialization}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00d4ff]" />
          Find Doctors
        </h3>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#00d4ff] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map(doctor => {
            const isConnected = connectedDoctors.some(d => d.id === doctor.id);
            const hasPendingRequest = connectionRequests.some(r => r.doctorId === doctor.id && r.status === 'pending');
            
            return (
              <div key={doctor.id} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{doctor.name}</h4>
                      <p className="text-sm text-white/60">{doctor.specialization}</p>
                      <p className="text-xs text-white/40">
                        {doctor.assignedPatients?.length || 0} patients
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </span>
                    ) : hasPendingRequest ? (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnectToDoctor(doctor.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 bg-[#00d4ff] hover:bg-[#00b8e6] text-[#0a1628] px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No doctors found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface DoctorConnectionManagerProps {
  doctorId: string;
}

export function DoctorConnectionManager({ doctorId }: DoctorConnectionManagerProps) {
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConnectionRequests();
    loadConnectedPatients();
  }, [doctorId]);

  const loadConnectionRequests = async () => {
    try {
      const requests = JSON.parse(localStorage.getItem(`doctor_requests_${doctorId}`) || '[]');
      setConnectionRequests(requests.filter((r: any) => r.status === 'pending'));
    } catch (error) {
      console.error('Error loading connection requests:', error);
    }
  };

  const loadConnectedPatients = async () => {
    try {
      const connections = JSON.parse(localStorage.getItem(`doctor_patients_${doctorId}`) || '[]');
      setConnectedPatients(connections);
    } catch (error) {
      console.error('Error loading connected patients:', error);
    }
  };

  const handleConnectionRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      const request = connectionRequests.find(r => r.id === requestId);
      if (!request) return;

      const updatedRequests = connectionRequests.map(r => 
        r.id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r
      );
      
      const pendingRequests = updatedRequests.filter(r => r.status === 'pending');
      setConnectionRequests(pendingRequests);
      
      localStorage.setItem(`doctor_requests_${doctorId}`, JSON.stringify(updatedRequests));
      
      if (action === 'accept') {
        const doctor = doctors.find(d => d.id === doctorId);
        const newConnection = {
          id: request.patientId,
          name: `Patient ${request.patientId}`,
          patientId: request.patientId,
          connectedAt: new Date().toISOString()
        };
        
        const updatedConnections = [...connectedPatients, newConnection];
        setConnectedPatients(updatedConnections);
        localStorage.setItem(`doctor_patients_${doctorId}`, JSON.stringify(updatedConnections));
        
        const patientConnections = JSON.parse(localStorage.getItem(`patient_doctors_${request.patientId}`) || '[]');
        const doctorConnection = {
          id: doctorId,
          name: doctor?.name || 'Doctor',
          specialization: doctor?.specialization || 'General',
          connectedAt: new Date().toISOString()
        };
        localStorage.setItem(`patient_doctors_${request.patientId}`, JSON.stringify([...patientConnections, doctorConnection]));
        
        toast.success(`Connection accepted with patient ${request.patientId}`);
      } else {
        toast.success(`Connection request rejected`);
      }

    } catch (error) {
      console.error('Error handling connection request:', error);
      toast.error('Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {connectionRequests.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Connection Requests ({connectionRequests.length})
          </h3>
          <div className="space-y-3">
            {connectionRequests.map(request => (
              <div key={request.id} className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Patient {request.patientId}</h4>
                    <p className="text-sm text-white/60">
                      Requested: {new Date(request.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnectionRequest(request.id, 'accept')}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleConnectionRequest(request.id, 'reject')}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Connected Patients ({connectedPatients.length})
        </h3>
        
        {connectedPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedPatients.map(patient => (
              <div key={patient.id} className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400">{patient.patientId}</h4>
                    <p className="text-sm text-white/60">
                      Connected: {new Date(patient.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No connected patients yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
