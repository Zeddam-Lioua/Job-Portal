import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import HRDashboard from "./components/HR/Dashboard";
import DMDashboard from "./components/DM/Dashboard";
import JobList from "./components/Public/JobList";
import About from "./components/Public/About";
import PrivateRoute from "./components/Auth/PrivateRoute";
import JobApplication from "./components/Public/JobApplication";
import ResumeDetail from "./components/HR/ResumeDetail";
import PdfViewer from "./components/HR/PdfViewer";
import OTPVerification from "./components/Auth/OTPVerification";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/verify-otp" element={<OTPVerification />} />
          <Route
            path="/admin/hr/dashboard/*"
            element={
              <PrivateRoute>
                <HRDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dm/dashboard/*"
            element={
              <PrivateRoute>
                <DMDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/apply/:id" element={<JobApplication />} />
          <Route path="/resume-detail/:id" element={<ResumeDetail />} />
          <Route path="/pdf-viewer" element={<PdfViewer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
