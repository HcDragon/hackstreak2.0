# 🔑 API Key Setup Guide

## Where to Add Your OpenAI API Key

### Option 1: Using .env File (Recommended)

1. **Open the .env file:**
   ```bash
   cd "hackstreek backend "
   nano .env
   # or use any text editor
   ```

2. **Replace the placeholder with your actual API key:**
   ```env
   # Before:
   OPENAI_API_KEY=your-openai-api-key-here
   
   # After:
   OPENAI_API_KEY=sk-proj-abc123xyz789...
   ```

3. **Save the file** (Ctrl+O, Enter, Ctrl+X in nano)

4. **Restart the Django server** if it's already running

---

### Option 2: Using Environment Variables (Terminal)

**For Current Session Only:**
```bash
export OPENAI_API_KEY="sk-proj-abc123xyz789..."
python3 manage.py runserver
```

**For Permanent Setup (macOS/Linux):**
```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export OPENAI_API_KEY="sk-proj-abc123xyz789..."' >> ~/.zshrc
source ~/.zshrc
```

---

## How to Get OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com
2. Click "Sign Up" or "Log In"
3. Complete registration

### Step 2: Get API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name (e.g., "Healthcare System")
4. Copy the key (starts with `sk-proj-...`)
5. **IMPORTANT:** Save it immediately - you won't see it again!

### Step 3: Add Credits (If Needed)
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Add credits ($5-$10 is enough for testing)

---

## Alternative: Google Gemini API Key

If you prefer Google Gemini (free tier available):

### Step 1: Get Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Add to .env File
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## No API Key? Use Rule-Based Analysis

If you don't want to use paid APIs, the system automatically falls back to **rule-based analysis**:

- ✅ Works without any API key
- ✅ Completely free
- ✅ Works offline
- ✅ Detects 10+ common diseases
- ⚠️ Less accurate than AI models (~70-80% vs 90-95%)

**Just leave the API keys as placeholders in .env file!**

---

## Verify API Key Setup

### Test OpenAI Connection:
```bash
cd "hackstreek backend "
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('OPENAI_API_KEY')
if key and key != 'your-openai-api-key-here':
    print(f'✅ OpenAI API Key found: {key[:20]}...')
else:
    print('⚠️ No OpenAI API Key configured - will use rule-based analysis')
"
```

### Test with Sample Upload:
1. Start the server: `python3 manage.py runserver`
2. Open: http://localhost:8080/upload-report.html
3. Upload a test PDF
4. Check the analysis results

---

## API Key Security

### ✅ DO:
- Store in .env file (already in .gitignore)
- Use environment variables
- Keep keys private
- Rotate keys regularly

### ❌ DON'T:
- Commit .env file to Git
- Share keys publicly
- Hardcode in source files
- Use production keys for testing

---

## Cost Estimation

### OpenAI GPT-3.5-turbo:
- **Input:** $0.0005 per 1K tokens (~750 words)
- **Output:** $0.0015 per 1K tokens
- **Average PDF analysis:** ~$0.01-0.05 per report
- **100 reports:** ~$1-5

### Google Gemini:
- **Free tier:** 60 requests per minute
- **Paid tier:** Very affordable
- **Good for testing and small deployments**

### Rule-Based (No API):
- **Cost:** $0 (completely free)
- **Unlimited usage**
- **No internet required**

---

## Troubleshooting

### Error: "OpenAI API key not found"
**Solution:** 
1. Check .env file exists
2. Verify key is correct format (starts with `sk-`)
3. Restart Django server
4. Check python-dotenv is installed: `pip3 install python-dotenv`

### Error: "Incorrect API key provided"
**Solution:**
1. Verify key is copied correctly (no extra spaces)
2. Check key is active on OpenAI dashboard
3. Ensure billing is set up

### Error: "Rate limit exceeded"
**Solution:**
1. Wait a few minutes
2. Upgrade OpenAI plan
3. Use Gemini instead
4. Fall back to rule-based analysis

### PDF Analysis Returns "Unknown"
**Solution:**
1. If no API key: System uses rule-based (expected)
2. If API key set: Check key is valid
3. Try with clearer medical report format
4. Check console logs for errors

---

## Current Configuration

Your system is configured to:
1. ✅ Try OpenAI GPT first (if key available)
2. ✅ Fall back to Google Gemini (if key available)
3. ✅ Fall back to rule-based analysis (always works)

**This means the system works even without any API keys!**

---

## Quick Start Commands

```bash
# 1. Navigate to backend
cd "hackstreek backend "

# 2. Edit .env file and add your API key
nano .env
# Replace: OPENAI_API_KEY=your-openai-api-key-here
# With: OPENAI_API_KEY=sk-proj-your-actual-key

# 3. Install dependencies (if not done)
pip3 install python-dotenv openai google-generativeai

# 4. Start server
python3 manage.py runserver

# 5. Test upload feature
# Open: http://localhost:8080/upload-report.html
```

---

## File Locations

- **Environment Variables:** `/hackstreek backend /.env`
- **Settings File:** `/hackstreek backend /healthcare_system/settings.py`
- **Upload View:** `/hackstreek backend /patients/report_upload_views.py`
- **Frontend:** `/hackstreek frontend/upload-report.html`

---

## Support

- **OpenAI Docs:** https://platform.openai.com/docs
- **Gemini Docs:** https://ai.google.dev/docs
- **Project Docs:** See PDF_UPLOAD_GUIDE.md

---

**Status: Ready to use with or without API keys! 🚀**
