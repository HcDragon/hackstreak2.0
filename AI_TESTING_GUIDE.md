# 🧪 AI Report Analysis Testing Guide

## Quick Test Steps

### 1. Test AI Connection
```bash
curl http://localhost:8000/api/debug/ai-connection/
```

This will show:
- ✅ OpenAI API status
- ✅ Gemini API status  
- ✅ Rule-based analysis status
- 💡 Recommendations

### 2. Test with Sample Text
```bash
curl -X POST http://localhost:8000/api/debug/text-analysis/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient Name: John Doe. Chief Complaint: High fever and headache. Symptoms: Fever 102F, severe headache, body pain, rash. Diagnosis: Dengue fever confirmed by NS1 test. Prescription: Paracetamol, fluids, rest. Risk Level: HIGH."
  }'
```

### 3. Test PDF Upload (Debug Mode)
```bash
curl -X POST http://localhost:8000/api/debug/pdf-analysis/ \
  -F "file=@sample_medical_reports/dengue_report.pdf"
```

### 4. Test Full PDF Upload
```bash
curl -X POST http://localhost:8000/api/reports/upload/ \
  -F "file=@sample_medical_reports/dengue_report.pdf" \
  -F "patient_id=PAT00001" \
  -F "doctor_name=Dr. Test"
```

---

## Frontend Testing

### 1. Open Upload Page
```
http://localhost:8080/upload-report.html
```

### 2. Test Upload Process
1. Enter Patient ID: `PAT00001`
2. Enter Doctor Name: `Dr. Test`
3. Select a PDF from `sample_medical_reports/`
4. Click "Upload & Analyze Report"
5. Wait for AI analysis (10-30 seconds)
6. Review results

---

## Sample Medical Reports

The system created 5 test PDFs in `sample_medical_reports/`:

1. **dengue_report.pdf** - Dengue fever case
2. **diabetes_report.pdf** - Type 2 diabetes case  
3. **pneumonia_report.pdf** - Bacterial pneumonia case
4. **hypertension_report.pdf** - High blood pressure case
5. **covid_report.pdf** - COVID-19 case

---

## Expected AI Analysis Results

### For Dengue Report:
```json
{
  "disease": "Dengue",
  "symptoms": "fever, headache, body pain, rash, joint pain",
  "diagnosis": "Dengue fever confirmed through NS1 antigen test",
  "prescription": "Paracetamol 500mg - 3 times daily, Plenty of fluids, Complete bed rest",
  "risk_level": "HIGH",
  "summary": "Detected Dengue with HIGH risk level..."
}
```

### For Diabetes Report:
```json
{
  "disease": "Diabetes",
  "symptoms": "frequent urination, excessive thirst, fatigue, weight loss",
  "diagnosis": "Type 2 Diabetes Mellitus. HbA1c: 9.2% (elevated)",
  "prescription": "Metformin 500mg twice daily, Dietary modifications",
  "risk_level": "MEDIUM",
  "summary": "Detected Diabetes with MEDIUM risk level..."
}
```

---

## Troubleshooting

### Issue: "Could not extract text from PDF"
**Possible Causes:**
- PDF is image-based (scanned document)
- PDF is corrupted
- PDF has complex formatting

**Solutions:**
1. Try a different PDF
2. Check if PDF has selectable text
3. Use the debug endpoint to see extraction details

### Issue: AI returns "Unknown" disease
**Possible Causes:**
- Text extraction failed
- Medical terms not in keyword database
- API key issues

**Solutions:**
1. Check debug endpoint: `GET /api/debug/ai-connection/`
2. Test with sample text first
3. Verify API key is correct

### Issue: Analysis takes too long
**Possible Causes:**
- Large PDF file
- Slow API response
- Network issues

**Solutions:**
1. Use smaller PDF files
2. Check internet connection
3. Try rule-based analysis (no API needed)

---

## API Endpoints for Testing

### Debug Endpoints
- `GET /api/debug/ai-connection/` - Test AI connections
- `POST /api/debug/text-analysis/` - Test with raw text
- `POST /api/debug/pdf-analysis/` - Debug PDF analysis

### Production Endpoints  
- `POST /api/reports/upload/` - Upload and analyze PDF
- `GET /api/reports/patient/?patient_id=PAT00001` - Get patient reports

---

## Testing Different Scenarios

### 1. Test OpenAI Analysis
1. Ensure OpenAI API key is set in `.env`
2. Upload a PDF
3. Check response includes `"analysis_method": "OpenAI GPT-3.5"`

### 2. Test Rule-Based Analysis
1. Remove/comment out API keys in `.env`
2. Restart server
3. Upload a PDF
4. Check response includes `"analysis_method": "Enhanced Rule-based Analysis"`

### 3. Test Error Handling
1. Upload a non-PDF file
2. Upload with invalid patient ID
3. Upload corrupted PDF

---

## Performance Testing

### Test with Multiple Files
```bash
# Test all sample reports
for file in sample_medical_reports/*.pdf; do
  echo "Testing: $file"
  curl -X POST http://localhost:8000/api/debug/pdf-analysis/ \
    -F "file=@$file"
  echo "---"
done
```

### Measure Response Times
```bash
time curl -X POST http://localhost:8000/api/reports/upload/ \
  -F "file=@sample_medical_reports/dengue_report.pdf" \
  -F "patient_id=PAT00001"
```

---

## Expected Performance

### Text Extraction
- **Small PDF (1-2 pages):** 1-3 seconds
- **Large PDF (5+ pages):** 3-10 seconds

### AI Analysis
- **OpenAI GPT:** 5-15 seconds
- **Google Gemini:** 5-10 seconds  
- **Rule-based:** <1 second

### Total Processing Time
- **With AI:** 10-30 seconds
- **Rule-based only:** 2-5 seconds

---

## Accuracy Testing

### Test Known Medical Reports
1. Create PDFs with known diagnoses
2. Upload and analyze
3. Compare AI results with expected results
4. Calculate accuracy percentage

### Test Edge Cases
- Reports with multiple diseases
- Reports with unclear symptoms
- Reports with medical abbreviations
- Reports with poor formatting

---

## Integration Testing

### Test Full Workflow
1. Register a patient
2. Upload medical report for that patient
3. Search patient to see new record
4. Check dashboard for updated statistics
5. View AI predictions

### Test Error Recovery
1. Upload invalid file
2. Verify error message
3. Upload valid file
4. Verify success

---

## Monitoring and Logging

### Check Server Logs
```bash
# In terminal running Django server
# Look for extraction and analysis logs
```

### Check API Response Times
- Monitor response times in browser dev tools
- Check for timeout errors
- Verify all endpoints respond correctly

---

## Success Criteria

### ✅ Text Extraction
- [ ] PDFs extract readable text
- [ ] Medical terms are preserved
- [ ] Formatting is cleaned properly

### ✅ AI Analysis  
- [ ] Diseases are correctly identified
- [ ] Symptoms are extracted accurately
- [ ] Risk levels are appropriate
- [ ] Prescriptions are captured

### ✅ Database Integration
- [ ] Medical records are created
- [ ] Patient history is updated
- [ ] Data is stored correctly

### ✅ Error Handling
- [ ] Invalid files are rejected
- [ ] Missing patients are handled
- [ ] API errors are caught

---

## Next Steps After Testing

1. **If everything works:** System is ready for demo!
2. **If issues found:** Use debug endpoints to identify problems
3. **For better accuracy:** Add more medical keywords to rule-based analysis
4. **For production:** Add rate limiting, file size limits, security measures

---

**Ready to test! 🚀**

Start with: `curl http://localhost:8000/api/debug/ai-connection/`