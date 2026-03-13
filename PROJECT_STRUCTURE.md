# Smart Healthcare System - Frontend Project Structure

## 📁 Directory Layout

```
Smart Healthcare System Setup/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── use-mobile.ts
│   │   │   │   └── utils.ts
│   │   │   └── SharedHeader.tsx       # Shared header component
│   │   ├── pages/
│   │   │   ├── Login.tsx              # Login & signup page
│   │   │   ├── PatientDashboard.tsx   # Patient dashboard
│   │   │   ├── PatientRegistration.tsx # Patient registration
│   │   │   ├── DoctorDashboard.tsx    # Doctor dashboard
│   │   │   └── AdminDashboard.tsx     # Admin dashboard
│   │   ├── App.tsx                    # Main app component
│   │   └── routes.tsx                 # Route configuration
│   ├── services/
│   │   └── api.ts                     # API service layer
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── main.tsx                       # Application entry point
├── index.html                         # HTML template
├── package.json                       # Dependencies
├── package-lock.json
├── vite.config.ts                     # Vite configuration
├── postcss.config.mjs                 # PostCSS configuration
├── README_FRONTEND.md                 # Frontend documentation
└── PROJECT_STRUCTURE.md               # This file
```

## 🎯 Key Files

### Pages
- **Login.tsx**: Handles patient signup/login and doctor/admin login
- **PatientDashboard.tsx**: Patient health dashboard with medical records and QR code
- **PatientRegistration.tsx**: Standalone patient registration page
- **DoctorDashboard.tsx**: Doctor interface for managing patients
- **AdminDashboard.tsx**: Admin system management

### Services
- **api.ts**: Centralized API service with all backend endpoints

### Components
- **UI Components**: Reusable components from shadcn/ui library
- **SharedHeader.tsx**: Common header component

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📡 API Integration

All API calls go through `src/services/api.ts`:
- Patient authentication (signup/login)
- Medical records management
- QR code operations
- Doctor dashboard operations
- Admin operations

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Dark theme with gradient backgrounds
- **Responsive Design**: Mobile-first approach

## 🔐 Authentication

- Token-based authentication
- Patient tokens stored in localStorage
- Doctor/Admin tokens for their respective dashboards

## 📱 Features

✅ Patient Registration & Login
✅ Patient Dashboard with Medical Records
✅ QR Code Generation & Display
✅ Doctor Dashboard
✅ Admin Dashboard
✅ Responsive Design
✅ Dark Theme UI

---

**Last Updated**: March 13, 2026
