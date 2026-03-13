# 🔐 Admin & Login Credentials Guide

## Complete Login Credentials for Smart Healthcare System

### 🏥 **Admin Login**

#### **Primary Admin Account:**
```
Username: admin
Password: admin123
```

#### **Alternative Admin Access (Doctor Account):**
```
Username: doctor1
Password: doctor123
```

**Access URL:** `http://localhost:5173` → Select "Admin" role

**Features:**
- System administration
- Analytics dashboard
- User management
- Disease surveillance
- Health trends monitoring

---

### 👨‍⚕️ **Doctor Login**

#### **Doctor Account 1:**
```
Username: doctor1
Password: doctor123
```

#### **Doctor Account 2:**
```
Username: doctor2
Password: doctor123
```

**Access URL:** `http://localhost:5173` → Select "Doctor" role

**Features:**
- Patient management
- Medical records
- Prescriptions
- Report uploads
- Patient connections
- Appointments
- Emergency alerts
- Teleconsultation

---

### 🏥 **Patient Login**

#### **Demo Patient 1:**
```
Patient ID: PAT00001
Password: patient123
```

#### **Demo Patient 2:**
```
Patient ID: PAT00002
Password: patient123
```

**Access URL:** `http://localhost:5173` → Select "Patient" role

**Features:**
- View medical records
- Access prescriptions
- View reports
- QR code management
- Doctor connections
- Appointment booking

---

### 📝 **Patient Registration**

**New patients can register at:**
- Click "New patient? Create account" on login page
- Or visit: `http://localhost:5173/register`

**Registration generates:**
- Unique Patient ID (e.g., PAT00003, PAT00004, etc.)
- Secure password
- QR code for quick access

---

## 🔧 Backend Admin Panel

### **Django Admin Panel:**

**URL:** `http://localhost:8000/admin/`

**To create superuser:**
```bash
cd "/Users/aravmalviya/Desktop/hackstreek backend "
python3 manage.py createsuperuser
```

Follow prompts to create:
- Username
- Email
- Password

---

## 🚀 Quick Start Guide

### **1. Start Backend:**
```bash
cd "/Users/aravmalviya/Desktop/hackstreek backend "
python3 manage.py runserver
```
Backend runs at: `http://localhost:8000`

### **2. Start Frontend:**
```bash
cd "/Users/aravmalviya/Downloads/Smart Healthcare System Setup"
npm run dev
```
Frontend runs at: `http://localhost:5173`

### **3. Login:**
- Open `http://localhost:5173`
- Select role (Admin/Doctor/Patient)
- Enter credentials
- Click "Sign in"

---

## 🎯 Testing Scenarios

### **Scenario 1: Admin Access**
1. Go to login page
2. Select "Admin" role
3. Enter: `admin` / `admin123`
4. Access admin dashboard with analytics

### **Scenario 2: Doctor Workflow**
1. Login as doctor: `doctor1` / `doctor123`
2. View patient directory
3. Search patient by ID: `PAT00001`
4. Connect to patient
5. Upload reports
6. Prescribe medicines

### **Scenario 3: Patient Experience**
1. Login as patient: `PAT00001` / `patient123`
2. View medical records
3. Check prescriptions
4. View QR code
5. Connect to doctors

### **Scenario 4: New Patient Registration**
1. Click "New patient? Create account"
2. Fill registration form
3. Receive Patient ID
4. Login with new credentials
5. Access patient dashboard

---

## 🔒 Security Notes

### **Password Requirements:**
- Minimum 6 characters
- Alphanumeric recommended
- Demo passwords are simplified for testing

### **Token Management:**
- Tokens stored in localStorage
- Automatic logout on token expiry
- Secure API communication

### **Role-Based Access:**
- **Admin:** Full system access
- **Doctor:** Patient management, medical records
- **Patient:** Personal health records only

---

## 📊 API Endpoints

### **Authentication:**
- Doctor Login: `POST /api/doctor/login/`
- Patient Login: `POST /api/auth/patient/login/`
- Admin Login: `POST /api/admin/login/` (with fallback)

### **Patient Management:**
- Get All Patients: `GET /api/patients/`
- Search Patient: `GET /api/patients/search/?patient_id=PAT00001`
- Create Patient: `POST /api/patients/`

### **Doctor Operations:**
- Get Dashboard: `GET /api/doctor/dashboard/`
- Get Patients: `GET /api/doctor/patients/`
- Create Medical Record: `POST /api/doctor/medical-records/`

---

## 🐛 Troubleshooting

### **Issue: Cannot login**
- Check backend is running on port 8000
- Verify credentials are correct
- Clear browser localStorage
- Check browser console for errors

### **Issue: Patient not found**
- Ensure Patient ID format is correct (PAT00001)
- Check patient exists in system
- Try registering new patient

### **Issue: Admin access denied**
- Use `admin`/`admin123` credentials
- Or use doctor credentials as fallback
- Check userType in localStorage

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify backend API is accessible
- Review network tab for failed requests
- Ensure all dependencies are installed

---

**Built with ❤️ for Smart Healthcare Management**

Last Updated: March 2024
