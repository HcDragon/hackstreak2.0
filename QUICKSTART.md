# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd "hackstreek backend "
pip3 install Django djangorestframework qrcode pillow django-cors-headers
```

### Step 2: Setup Database
```bash
python3 manage.py migrate
```

### Step 3: Create Admin User (Optional)
```bash
python3 manage.py createsuperuser
```

### Step 4: Populate Sample Data
```bash
python3 populate_data.py
```

### Step 5: Start Backend Server
```bash
python3 manage.py runserver
```

Backend is now running at: **http://localhost:8000**

### Step 6: Open Frontend
Open any of these files in your browser:
- `hackstreek frontend/index.html` - Main interface
- `hackstreek frontend/dashboard.html` - Analytics dashboard
- `hackstreek frontend/ai-dashboard.html` - AI predictions

## 📱 What You Can Do Now

### 1. Register Patients
- Go to "Register Patient" tab
- Fill in details and submit
- QR code generated automatically

### 2. Add Medical Records
- Go to "Add Medical Record" tab
- Enter patient ID and medical details
- Submit to update records

### 3. Search Patients
- Go to "Search Patient" tab
- Enter patient ID (e.g., PAT00001)
- View complete medical history

### 4. View Analytics
- Click "Dashboard" for basic stats
- Open `dashboard.html` for advanced charts
- Open `ai-dashboard.html` for AI predictions

## 🤖 AI Features

### Outbreak Prediction
- Analyzes last 30 days of data
- Calculates growth rates
- Predicts next week's cases
- Risk levels: LOW, MEDIUM, HIGH, CRITICAL

### Real-Time Alerts
- Detects disease spikes (>50% increase)
- Critical alerts for outbreaks (>100% increase)
- Location-based warnings
- New disease emergence detection

### Patient Risk Assessment
- Individual risk scoring (0-100)
- Age-based risk factors
- Medical history analysis
- Location risk evaluation
- Personalized recommendations

### Disease Recommendations
- Prevention guidelines
- Treatment advice
- Risk factors
- Severity assessment

## 📊 Sample Data Included

After running `populate_data.py`:
- 10 patients across 7 cities
- 50+ medical records
- 8 different diseases
- Outbreak scenarios included
- Last 30 days of data

## 🔗 Important URLs

- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/
- **API Docs:** See API_DOCUMENTATION.md

## 🧪 Test the APIs

### Using Browser
```
http://localhost:8000/api/patients/
http://localhost:8000/api/medical-records/
http://localhost:8000/api/ai/outbreak-prediction/
http://localhost:8000/api/ai/alerts/
```

### Using cURL
```bash
# Get all patients
curl http://localhost:8000/api/patients/

# Get outbreak predictions
curl http://localhost:8000/api/ai/outbreak-prediction/

# Get disease recommendations
curl http://localhost:8000/api/ai/recommendations/?disease=Dengue

# Assess patient risk
curl http://localhost:8000/api/ai/risk-assessment/?patient_id=PAT00001
```

## 🎯 Demo Flow for Judges

1. **Show Patient Registration**
   - Register a new patient
   - Show auto-generated Patient ID
   - Display QR code generation

2. **Add Medical Records**
   - Add multiple records for different patients
   - Show different diseases and locations

3. **Analytics Dashboard**
   - Open `dashboard.html`
   - Show disease trends
   - Display location-based analysis
   - Demonstrate heatmap

4. **AI Predictions**
   - Open `ai-dashboard.html`
   - Show outbreak predictions
   - Display real-time alerts
   - Demonstrate risk assessment
   - Show disease recommendations

5. **Search & History**
   - Search for a patient
   - Show complete medical history
   - Display QR code

## 💡 Tips

- Use Chrome/Firefox for best experience
- Keep backend running while using frontend
- Check browser console for any errors
- Admin panel credentials: (username/password you created)
- Sample patient IDs: PAT00001 to PAT00010

## 🐛 Troubleshooting

**Backend not starting?**
```bash
# Check if port 8000 is free
lsof -i :8000

# Kill existing process if needed
kill -9 <PID>
```

**Frontend not loading data?**
- Ensure backend is running
- Check browser console for CORS errors
- Verify API_BASE_URL in script files

**QR codes not showing?**
- Check media folder exists
- Verify Pillow is installed
- Check file permissions

## 📞 Need Help?

- Check README.md for detailed documentation
- See API_DOCUMENTATION.md for API details
- Review code comments for implementation details

---

**Ready to impress the judges! 🏆**
