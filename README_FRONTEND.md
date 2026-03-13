# Smart Healthcare System - Frontend

A modern React-based frontend for the Smart Healthcare System with patient authentication, QR code management, and comprehensive dashboard features.

## 🚀 Features

### Patient Features
- **Patient Registration**: Complete signup with personal and medical information
- **Patient Authentication**: Secure login with Patient ID and password
- **Patient Dashboard**: Personal health records, prescriptions, and reports
- **QR Code Management**: View and manage personal health QR codes
- **Medical Records**: View complete medical history and treatments

### Doctor Features
- **Doctor Dashboard**: Manage patients and medical records
- **Patient Management**: Add medical records and prescriptions
- **Medicine Management**: Track and manage medications

### Admin Features
- **System Administration**: Comprehensive system management
- **Analytics Dashboard**: Health trends and disease surveillance

## 🛠️ Technology Stack

- **React 18.3.1** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Sonner** - Beautiful toast notifications
- **Lucide React** - Modern icon library

## 📦 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd "/Users/aravmalviya/Downloads/Smart Healthcare System Setup"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🔧 Configuration

### Backend Connection
The frontend is configured to connect to the Django backend at `http://localhost:8000`. 

If your backend is running on a different port, update the `API_BASE_URL` in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Environment Variables
Create a `.env` file in the root directory if you need custom configuration:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🎯 Usage

### For Patients

1. **New Patient Registration:**
   - Click "Register New Patient" on the login page
   - Fill in all required information
   - Receive your unique Patient ID
   - Use Patient ID and password to login

2. **Patient Login:**
   - Select "Patient" role
   - Enter your Patient ID and password
   - Access your personal dashboard

3. **Patient Dashboard Features:**
   - View medical records and history
   - Check active prescriptions
   - View medical reports
   - Display QR code for quick access

### For Doctors

1. **Doctor Login:**
   - Select "Doctor" role
   - Use demo credentials: `doctor1` / `doctor123`
   - Access doctor dashboard

2. **Doctor Features:**
   - Manage patient records
   - Add medical records and prescriptions
   - View patient information

### For Admins

1. **Admin Login:**
   - Select "Admin" role
   - Use doctor credentials for admin access
   - Access system administration features

## 🔐 Demo Credentials

### Doctor Login
- **Username:** `doctor1`
- **Password:** `doctor123`

### Patient Login
- **Patient ID:** `PAT00001`
- **Password:** `patient123`

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark interface with gradient backgrounds
- **Smooth Animations**: Motion-powered transitions and interactions
- **Glass Morphism**: Modern backdrop blur effects
- **Interactive Elements**: Hover states and micro-interactions
- **Accessible Design**: WCAG compliant interface elements

## 🔗 API Integration

The frontend integrates with the Django backend through RESTful APIs:

- **Patient APIs**: Registration, authentication, profile management
- **Medical Record APIs**: CRUD operations for medical records
- **QR Code APIs**: Generate and retrieve patient QR codes
- **Doctor APIs**: Patient management and medical record creation
- **AI APIs**: Disease predictions and health recommendations

## 🚀 Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── App.tsx        # Main app component
│   └── routes.tsx     # Route configuration
├── services/
│   └── api.ts         # API service layer
├── styles/            # CSS and styling
└── main.tsx          # Application entry point
```

### Adding New Features

1. **New Pages**: Add to `src/app/pages/`
2. **New Components**: Add to `src/app/components/`
3. **API Endpoints**: Update `src/services/api.ts`
4. **Routes**: Update `src/app/routes.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error:**
   - Ensure Django backend is running on `http://localhost:8000`
   - Check CORS settings in Django
   - Verify API endpoints are accessible

2. **Build Errors:**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript errors in the console
   - Ensure all imports are correct

3. **Authentication Issues:**
   - Clear browser localStorage
   - Check token expiration
   - Verify backend authentication endpoints

### Development Tips

- Use browser dev tools to inspect API calls
- Check console for error messages
- Use React Developer Tools for component debugging

## 📞 Support

For issues or questions:
- Check the browser console for errors
- Verify backend is running and accessible
- Review API documentation
- Test endpoints using browser network tab

---

**Built with ❤️ for Smart Healthcare Management**