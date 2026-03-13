import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PatientRegistration } from "./pages/PatientRegistration";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <PatientRegistration />,
  },
  {
    path: "/patient",
    element: <PatientDashboard />,
  },
  {
    path: "/doctor",
    element: <DoctorDashboard />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  }
]);
