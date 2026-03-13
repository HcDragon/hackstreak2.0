import React, { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Eye, EyeOff, Stethoscope, User, Shield, UserPlus } from "lucide-react";
import API from "../../services/api";

export function Login() {
  const [userType, setUserType] = useState<"patient" | "doctor" | "admin">("doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    patientId: "",
    // Signup fields
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    location: "",
    blood_group: "",
    emergency_contact_name: "",
    emergency_contact_phone: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const signupData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        location: formData.location,
        blood_group: formData.blood_group,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        password: formData.password
      };

      const response = await API.patient.signup(signupData);
      
      if (response.success) {
        toast.success(`Account created! Your Patient ID is: ${response.patient.patient_id}`);
        setIsSignup(false);
        setFormData({ ...formData, patientId: response.patient.patient_id });
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (userType === "doctor") {
        const response = await API.auth.doctorLogin({
          username: formData.username,
          password: formData.password
        });
        
        if (response.success && response.token) {
          localStorage.setItem('doctorToken', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.doctor));
          localStorage.setItem('userType', 'doctor');
          
          toast.success(`Welcome ${response.doctor.user?.first_name || 'Doctor'}!`);
          window.location.href = '/doctor';
        }
      } else if (userType === "patient") {
        if (isSignup) {
          return handlePatientSignup(e);
        }
        
        // Patient login with patient ID and password
        if (!formData.patientId || !formData.password) {
          toast.error("Please enter your Patient ID and password");
          return;
        }
        
        console.log('Attempting patient login with:', { patient_id: formData.patientId });
        
        try {
          const response = await API.patient.login({
            patient_id: formData.patientId,
            password: formData.password
          });
          
          console.log('Login response:', response);
          
          if (response.success && response.token) {
            localStorage.setItem('patientToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.patient));
            localStorage.setItem('userType', 'patient');
            toast.success(`Welcome ${response.patient.name}!`);
            window.location.href = '/patient';
          } else {
            toast.error('Login failed: Invalid response format');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          toast.error(error.message || "Invalid Patient ID or password");
        }
      } else if (userType === "admin") {
        // Admin login with dedicated endpoint
        const response = await API.auth.adminLogin({
          username: formData.username,
          password: formData.password
        });
        
        if (response.success && response.token) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.admin || response.doctor));
          localStorage.setItem('userType', 'admin');
          
          const userName = response.admin?.user?.first_name || response.doctor?.user?.first_name || 'Admin';
          toast.success(`Welcome ${userName}!`);
          window.location.href = '/admin';
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    { 
      id: "patient" as const, 
      label: "Patient", 
      icon: User, 
      color: "from-blue-500 to-cyan-500",
      description: "Access your medical records and appointments"
    },
    { 
      id: "doctor" as const, 
      label: "Doctor", 
      icon: Stethoscope, 
      color: "from-emerald-500 to-teal-500",
      description: "Manage patients and medical records"
    },
    { 
      id: "admin" as const, 
      label: "Admin", 
      icon: Shield, 
      color: "from-purple-500 to-indigo-500",
      description: "System administration and analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-['Sora'] text-white mb-2">
            Smart Healthcare
          </h1>
          <p className="text-white/60 text-sm">
            Secure access to your healthcare portal
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-8">
          <p className="text-white/70 text-sm mb-4 text-center">Select your role</p>
          <div className="grid grid-cols-3 gap-3">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isActive = userType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 ${
                    isActive 
                      ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeUserType"
                      className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/20 to-blue-600/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <div className="relative z-10 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isActive ? 'text-[#00d4ff]' : 'text-white/60'
                    }`} />
                    <p className={`text-xs font-medium ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`}>
                      {type.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <motion.div
          key={userType}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {userType === "patient" ? (
              isSignup ? (
                // Patient Signup Form
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Age"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Gender</label>
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
                      <label className="block text-white/70 text-sm font-medium mb-2">Blood Group</label>
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
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full Address"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City/Location"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Emergency Contact Name</label>
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleInputChange}
                        placeholder="Emergency Contact"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleInputChange}
                        placeholder="Emergency Phone"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Patient Login Form
                <>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Patient ID</label>
                    <input
                      type="text"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      placeholder="Enter your Patient ID (e.g., PAT00001)"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : (
              <>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00d4ff] to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-[#00b8e6] hover:to-blue-700 transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignup ? 'Creating Account...' : 'Signing in...'}
                </div>
              ) : (
                isSignup ? 'Create Account' : `Sign in as ${userTypes.find(t => t.id === userType)?.label}`
              )}
            </button>

            {userType === "patient" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setFormData({ ...formData, patientId: "", password: "" });
                  }}
                  className="text-[#00d4ff] hover:text-blue-400 text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSignup ? 'Already have an account? Sign in' : 'New patient? Create account'}
                </button>
              </div>
            )}
          </form>

          {/* Demo Credentials */}
          {userType === "doctor" && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/60 text-xs mb-2">Demo Doctor Credentials:</p>
              <div className="text-xs text-white/80 space-y-1">
                <p><strong>Username:</strong> doctor1</p>
                <p><strong>Password:</strong> doctor123</p>
              </div>
            </div>
          )}

          {userType === "admin" && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-purple-500/20">
              <p className="text-white/60 text-xs mb-2">Demo Admin Credentials:</p>
              <div className="text-xs text-white/80 space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
                <p className="text-white/50 text-xs mt-2">Alternative: Use doctor1/doctor123</p>
              </div>
            </div>
          )}

          {userType === "patient" && !isSignup && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/60 text-xs mb-2">Demo Patient Login:</p>
              <div className="text-xs text-white/80 space-y-1">
                <p><strong>Patient ID:</strong> PAT00001</p>
                <p><strong>Password:</strong> patient123</p>
                <p className="text-white/50 text-xs mt-2">Note: Login uses Patient ID lookup</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-xs mb-4">
            Secure healthcare management system
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <button
              onClick={() => window.location.href = '/register'}
              className="text-[#00d4ff] hover:text-blue-400 transition-colors"
            >
              Register New Patient
            </button>
            <span className="text-white/20">•</span>
            <span className="text-white/40">Healthcare Provider Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}