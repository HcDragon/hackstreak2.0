# Smart Healthcare History & Disease Surveillance System

## 🏥 Project Overview
A comprehensive healthcare management system with patient registration, QR-based smart health cards, medical record management, and disease surveillance dashboard.

## ✨ Features Implemented

### Core Features
1. **Patient Registration & Management**
   - Register patients with complete details
   - Auto-generated unique Patient ID
   - Store medical information (name, age, location, blood group, etc.)

2. **QR-Based Smart Health Card**
   - Automatic QR code generation for each patient
   - QR code contains patient identification details
   - Quick access to patient records via QR scan

3. **Medical Record Update Module**
   - Doctors can add diagnoses, prescriptions, and treatment details
   - Complete medical history tracking
   - Visit date and doctor name recording

4. **Disease Monitoring Dashboard**
   - Real-time disease trend visualization
   - Interactive charts using Chart.js
   - Disease distribution by location
   - Top diseases analysis
   - Disease heatmap by location
   - Automated health alerts for disease outbreaks

### 🤖 AI-Powered Innovation Features

5. **Disease Outbreak Prediction**
   - AI-based trend analysis using historical data
   - Weekly growth rate calculation
   - Risk level assessment (LOW, MEDIUM, HIGH, CRITICAL)
   - Predicted case numbers for next week
   - Automatic outbreak detection

6. **Real-Time Health Alerts**
   - Automatic detection of disease spikes
   - Critical alerts for rapid case increases (>100%)
   - Warning alerts for concerning trends (>50%)
   - Location-based outbreak notifications
   - New disease emergence detection

7. **Disease Hotspot Identification**
   - Location-based disease clustering
   - Hotspot detection using statistical analysis
   - Geographic risk assessment
   - Multi-disease tracking per location

8. **AI-Powered Disease Recommendations**
   - Prevention guidelines for common diseases
   - Treatment recommendations
   - Risk factor identification
   - Severity level assessment
   - Evidence-based medical advice

9. **Patient Risk Assessment**
   - Individual risk scoring (0-100)
   - Age-based risk factors
   - Medical history analysis
   - Location-based risk evaluation
   - Personalized health recommendations
   - Prevalent disease warnings for patient's area

10. **AI-Powered PDF Report Analysis** 🆕
   - Upload medical reports in PDF format
   - Automatic text extraction (PyPDF2/pdfplumber)
   - AI analysis using OpenAI GPT, Google Gemini, or rule-based
   - Detects disease, symptoms, diagnosis, prescription
   - Risk level assessment (LOW/MEDIUM/HIGH/CRITICAL)
   - Auto-creates medical record from report
   - Supports 10+ common diseases

## 🛠️ Technology Stack

### Backend
- Django 6.0.3
- Django REST Framework 3.16.1
- SQLite Database
- QRCode 8.2 (for QR generation)
- Pillow (for image processing)
- Django CORS Headers

### Frontend
- HTML5, CSS3, JavaScript
- Chart.js (for data visualization)
- Responsive design

## 📁 Project Structure

```
hackstreek backend/
├── healthcare_system/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── patients/                   # Main app
│   ├── models.py              # Patient & MedicalRecord models
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API endpoints
│   ├── urls.py                # App URLs
│   └── admin.py               # Admin panel config
├── media/qr_codes/            # Generated QR codes
├── manage.py
└── requirements.txt

hackstreek frontend/
├── index.html                 # Main interface
├── dashboard.html             # Advanced analytics dashboard
├── ai-dashboard.html          # AI predictions & alerts
├── style.css                  # Styling
└── script.js                  # API integration
```

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "hackstreek backend "
   ```

2. **Install dependencies:**
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Run migrations (already done):**
   ```bash
   python3 manage.py makemigrations
   python3 manage.py migrate
   ```

4. **Create superuser (optional for admin panel):**
   ```bash
   python3 manage.py createsuperuser
   ```

5. **Start the server:**
   ```bash
   python3 manage.py runserver
   ```

   Backend will run at: `http://localhost:8000`

6. **Populate with sample data (optional):**
   ```bash
   python3 populate_data.py
   ```
   This will create 10 sample patients and 50+ medical records for testing.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "../hackstreek frontend"
   ```

2. **Open in browser:**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     python3 -m http.server 8080
     ```
   - Access at: `http://localhost:8080`

## 📡 API Endpoints

### Patient APIs
- `POST /api/patients/` - Register new patient
- `GET /api/patients/` - List all patients
- `GET /api/patients/{id}/` - Get patient details
- `GET /api/patients/search/?patient_id=PAT00001` - Search by patient ID
- `GET /api/patients/{id}/qr_code/` - Get patient QR code

### Medical Record APIs
- `POST /api/medical-records/` - Add medical record
- `GET /api/medical-records/` - List all records
- `GET /api/medical-records/?patient_id=PAT00001` - Get patient's records
- `GET /api/medical-records/disease_stats/` - Get disease statistics

### AI-Powered APIs
- `GET /api/ai/outbreak-prediction/` - Get disease outbreak predictions
- `GET /api/ai/recommendations/?disease=Dengue` - Get disease recommendations
- `GET /api/ai/risk-assessment/?patient_id=PAT00001` - Assess patient risk
- `GET /api/ai/alerts/` - Get real-time health alerts

### Admin Panel
- Access at: `http://localhost:8000/admin`
- Manage patients and medical records

## 💻 Usage Guide

### 1. Register a Patient
- Go to "Register Patient" tab
- Fill in patient details
- Submit form
- QR code will be generated automatically

### 2. Search Patient
- Go to "Search Patient" tab
- Enter Patient ID (e.g., PAT00001)
- View complete patient profile with medical history

### 3. Add Medical Record
- Go to "Add Medical Record" tab
- Enter Patient ID
- Fill in disease, symptoms, diagnosis, prescription
- Add doctor name and visit date
- Submit to update patient records

### 4. View Dashboard
- Click "Dashboard" tab for basic stats
- Or open `dashboard.html` for advanced analytics
- Or open `ai-dashboard.html` for AI predictions
- View:
  - Total patients, records, diseases, locations
  - Top 10 diseases chart
  - Cases by location (pie chart)
  - Disease distribution across locations
  - Disease heatmap
  - Automated health alerts
  - AI outbreak predictions
  - Patient risk assessments
  - Disease recommendations

## 📊 Dashboard Features

### Visualizations
1. **Bar Chart** - Top 10 most common diseases
2. **Doughnut Chart** - Cases distribution by location
3. **Stacked Bar Chart** - Disease spread across locations
4. **Heatmap** - Disease intensity by location
5. **Alert System** - Automatic outbreak detection

### Statistics
- Total patients registered
- Total medical records
- Unique diseases tracked
- Locations covered

## 🔒 Security Features
- CORS enabled for frontend-backend communication
- Patient ID auto-generation
- Unique QR codes per patient
- Timestamped records (created_at, updated_at)

## 🎯 Innovation Opportunities (Future Enhancements)

- ✅ QR-based health card generation
- ✅ Disease surveillance dashboard
- ✅ Interactive visualizations
- ✅ Alert system for disease outbreaks
- ✅ AI-based disease outbreak prediction
- ✅ Real-time health alerts
- ✅ Patient risk assessment
- ✅ Disease recommendations system
- ✅ Hotspot identification
- ⏳ Role-based access control (Doctor/Admin/Patient)
- ⏳ SMS/Email notifications
- ⏳ Mobile app integration
- ⏳ Offline support for rural areas
- ⏳ Multi-language support
- ⏳ Machine learning model training on historical data
- ⏳ Integration with government health databases

## 🐛 Troubleshooting

### Backend not starting?
- Check if port 8000 is available
- Ensure all dependencies are installed
- Run migrations again

### Frontend not connecting?
- Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Verify API_BASE_URL in script.js

### QR codes not generating?
- Check media folder permissions
- Ensure Pillow is installed correctly
- Verify qrcode library installation

## 📝 Sample Data

### Sample Patient Registration
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street",
  "location": "Mumbai",
  "blood_group": "O+"
}
```

### Sample Medical Record
```json
{
  "patient": 1,
  "disease": "Dengue",
  "symptoms": "High fever, body pain, headache",
  "diagnosis": "Dengue fever confirmed",
  "prescription": "Rest, fluids, paracetamol",
  "doctor_name": "Dr. Smith",
  "visit_date": "2024-03-12",
  "notes": "Monitor platelet count"
}
```

## 👥 Team Roles Suggestion

1. **Backend Developer** - Django APIs, database, QR generation
2. **Frontend Developer** - UI/UX, API integration
3. **Data Analyst** - Dashboard, visualizations, analytics
4. **Designer** - UI design, user experience

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Test endpoints using Postman or browser

---

**Built with ❤️ for Smart Healthcare**
