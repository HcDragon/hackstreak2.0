# API Documentation - Smart Healthcare System

## Base URL
```
http://localhost:8000/api
```

## Patient Management APIs

### 1. Register New Patient
**Endpoint:** `POST /api/patients/`

**Request Body:**
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

**Response:**
```json
{
  "id": 1,
  "patient_id": "PAT00001",
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main Street",
  "location": "Mumbai",
  "blood_group": "O+",
  "qr_code": "/media/qr_codes/qr_PAT00001.png",
  "qr_code_url": "/media/qr_codes/qr_PAT00001.png",
  "medical_records": [],
  "created_at": "2024-03-12T10:30:00Z",
  "updated_at": "2024-03-12T10:30:00Z"
}
```

### 2. List All Patients
**Endpoint:** `GET /api/patients/`

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": "PAT00001",
    "name": "John Doe",
    ...
  }
]
```

### 3. Get Patient Details
**Endpoint:** `GET /api/patients/{id}/`

**Response:** Same as registration response with medical records

### 4. Search Patient by ID
**Endpoint:** `GET /api/patients/search/?patient_id=PAT00001`

**Response:** Patient details with complete medical history

### 5. Get Patient QR Code
**Endpoint:** `GET /api/patients/{id}/qr_code/`

**Response:**
```json
{
  "patient_id": "PAT00001",
  "name": "John Doe",
  "qr_code_url": "/media/qr_codes/qr_PAT00001.png"
}
```

## Medical Record APIs

### 1. Add Medical Record
**Endpoint:** `POST /api/medical-records/`

**Request Body:**
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

**Response:**
```json
{
  "id": 1,
  "patient": 1,
  "disease": "Dengue",
  "symptoms": "High fever, body pain, headache",
  "diagnosis": "Dengue fever confirmed",
  "prescription": "Rest, fluids, paracetamol",
  "doctor_name": "Dr. Smith",
  "visit_date": "2024-03-12",
  "notes": "Monitor platelet count",
  "created_at": "2024-03-12T10:35:00Z",
  "updated_at": "2024-03-12T10:35:00Z"
}
```

### 2. List All Medical Records
**Endpoint:** `GET /api/medical-records/`

### 3. Get Patient's Medical Records
**Endpoint:** `GET /api/medical-records/?patient_id=PAT00001`

### 4. Get Disease Statistics
**Endpoint:** `GET /api/medical-records/disease_stats/`

**Response:**
```json
[
  {
    "disease": "Dengue",
    "patient__location": "Mumbai",
    "count": 5
  },
  {
    "disease": "Malaria",
    "patient__location": "Delhi",
    "count": 3
  }
]
```

## AI-Powered APIs

### 1. Outbreak Prediction
**Endpoint:** `GET /api/ai/outbreak-prediction/`

**Description:** AI-based disease outbreak prediction with trend analysis

**Response:**
```json
{
  "predictions": [
    {
      "disease": "Dengue",
      "current_cases": 15,
      "weekly_trend": [12, 10, 8, 5],
      "growth_rate": 25.5,
      "risk_level": "HIGH",
      "predicted_next_week": 19
    }
  ],
  "alerts": [
    {
      "disease": "Dengue",
      "message": "HIGH ALERT: Dengue showing rapid growth (25.5%)",
      "severity": "high",
      "cases": 15,
      "growth_rate": 25.5
    }
  ],
  "hotspots": [
    {
      "location": "Mumbai",
      "total_cases": 25,
      "alert": "Mumbai is a disease hotspot with 25 cases"
    }
  ],
  "summary": {
    "total_diseases_tracked": 8,
    "high_risk_diseases": 2,
    "total_alerts": 3,
    "hotspot_locations": 2
  }
}
```

### 2. Disease Recommendations
**Endpoint:** `GET /api/ai/recommendations/?disease=Dengue`

**Description:** Get AI-powered prevention and treatment recommendations

**Response:**
```json
{
  "disease": "Dengue",
  "recommendations": {
    "prevention": [
      "Eliminate standing water around homes",
      "Use mosquito repellents and nets",
      "Wear long-sleeved clothing",
      "Install window screens"
    ],
    "treatment": [
      "Stay hydrated with plenty of fluids",
      "Take paracetamol for fever (avoid aspirin)",
      "Get adequate rest",
      "Monitor platelet count regularly"
    ],
    "risk_factors": [
      "Monsoon season",
      "Standing water",
      "Poor sanitation"
    ],
    "severity": "High"
  }
}
```

### 3. Patient Risk Assessment
**Endpoint:** `GET /api/ai/risk-assessment/?patient_id=PAT00001`

**Description:** Assess individual patient risk based on age, location, and medical history

**Response:**
```json
{
  "patient_id": "PAT00001",
  "name": "John Doe",
  "age": 35,
  "location": "Mumbai",
  "risk_assessment": {
    "risk_score": 45,
    "risk_level": "MEDIUM",
    "risk_factors": [
      "Multiple disease history (3 conditions)",
      "High disease prevalence in Mumbai"
    ]
  },
  "disease_history": ["Dengue", "Typhoid", "Malaria"],
  "location_risk": {
    "prevalent_diseases": [
      {"disease": "Dengue", "cases": 15},
      {"disease": "Malaria", "cases": 8}
    ],
    "total_cases_in_area": 45
  },
  "recommendations": [
    "Schedule regular health checkups",
    "Maintain vaccination records up to date",
    "Follow preventive measures strictly"
  ]
}
```

### 4. Real-Time Alerts
**Endpoint:** `GET /api/ai/alerts/`

**Description:** Get real-time health alerts for disease outbreaks and spikes

**Response:**
```json
{
  "alerts": [
    {
      "type": "OUTBREAK_ALERT",
      "severity": "CRITICAL",
      "disease": "Dengue",
      "location": "Mumbai",
      "message": "CRITICAL: Dengue cases in Mumbai increased by 150%",
      "current_cases": 15,
      "previous_cases": 6,
      "timestamp": "2024-03-12T10:40:00Z"
    },
    {
      "type": "WARNING",
      "severity": "HIGH",
      "disease": "Malaria",
      "location": "Delhi",
      "message": "WARNING: Malaria cases rising in Delhi (+75%)",
      "current_cases": 7,
      "previous_cases": 4,
      "timestamp": "2024-03-12T10:40:00Z"
    }
  ],
  "total_alerts": 2,
  "critical_alerts": 1,
  "generated_at": "2024-03-12T10:40:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "error": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Testing with cURL

### Register Patient
```bash
curl -X POST http://localhost:8000/api/patients/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 35,
    "gender": "Male",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main Street",
    "location": "Mumbai",
    "blood_group": "O+"
  }'
```

### Add Medical Record
```bash
curl -X POST http://localhost:8000/api/medical-records/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient": 1,
    "disease": "Dengue",
    "symptoms": "High fever, body pain",
    "diagnosis": "Dengue confirmed",
    "prescription": "Rest and fluids",
    "doctor_name": "Dr. Smith",
    "visit_date": "2024-03-12"
  }'
```

### Get Outbreak Predictions
```bash
curl http://localhost:8000/api/ai/outbreak-prediction/
```

### Get Disease Recommendations
```bash
curl http://localhost:8000/api/ai/recommendations/?disease=Dengue
```

### Assess Patient Risk
```bash
curl http://localhost:8000/api/ai/risk-assessment/?patient_id=PAT00001
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Patient IDs are auto-generated in format PAT00001, PAT00002, etc.
- QR codes are automatically generated on patient registration
- CORS is enabled for frontend integration
- All AI endpoints use historical data for predictions
- Alerts are generated based on 7-day and 14-day comparisons
