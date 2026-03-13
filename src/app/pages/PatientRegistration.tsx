import React, { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { 
  User, 
  ArrowLeft, 
  CheckCircle,
  QrCode,
  Download
} from "lucide-react";
import API from "../../services/api";

export function PatientRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    location: "",
    blood_group: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age)
      };

      const response = await API.patient.create(patientData);
      
      if (response) {
        setRegisteredPatient(response);
        toast.success(`Patient registered successfully! ID: ${response.patient_id}`);
        
        // Generate QR code
        try {
          await API.qr.generateQR(response.id);
        } catch (qrError) {
          console.log('QR generation will be handled later');
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRegisteredPatient(null);
    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      location: "",
      blood_group: ""
    });
  };

  if (registeredPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] text-white p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Patient Details</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-white/60 text-sm">Patient ID</p>
                  <p className="font-mono text-[#00d4ff] text-lg">{registeredPatient.patient_id}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Name</p>
                  <p className="font-medium">{registeredPatient.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Age</p>
                  <p className="font-medium">{registeredPatient.age} years</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Blood Group</p>
                  <p className="font-medium text-red-400">{registeredPatient.blood_group}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Phone</p>
                  <p className="font-medium">{registeredPatient.phone}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Location</p>
                  <p className="font-medium">{registeredPatient.location}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-[#00d4ff] text-[#0a1628] rounded-xl font-semibold hover:bg-[#00b8e6] transition-colors"
              >
                Register Another Patient
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-['Sora'] mb-2">Patient Registration</h1>
          <p className="text-white/60">Register a new patient in the healthcare system</p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Blood Group *
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Location/City *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter city or location"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#00d4ff] to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-[#00b8e6] hover:to-blue-700 transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering Patient...
                  </div>
                ) : (
                  "Register Patient"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}