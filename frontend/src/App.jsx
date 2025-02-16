import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthProvider from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Navbar from "./components/layout/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import HRDashboard from "./components/HR/Dashboard";
import DMDashboard from "./components/DM/Dashboard";
import JobList from "./components/Public/JobList";
import About from "./components/Public/About";
import PrivateRoute from "./components/Auth/PrivateRoute";
import JobApplication from "./components/Public/JobApplication";
import OTPVerification from "./components/Auth/OTPVerification";
import InterviewRoom from "./components/Stream/InterviewRoom";
import GuestInterview from "./components/Stream/GuestInterview";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="190055214049-gojlcmlfhpam7bg8sfvjelevfa30dl8d.apps.googleusercontent.com">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Navigate to="/admin/login" />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/register" element={<Register />} />
            <Route path="/admin/verify-otp" element={<OTPVerification />} />
            <Route path="/apply/:id" element={<JobApplication />} />
            <Route
              path="/guest/interview/:roomId"
              element={<GuestInterview />}
            />
            <Route path="*" element={<Navigate to="/" />} />

            <Route
              path="/admin/hr/dashboard/interview/:roomName"
              element={
                <PrivateRoute>
                  <InterviewRoom />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/hr/dashboard/*"
              element={
                <PrivateRoute>
                  <ThemeProvider>
                    <HRDashboard />
                  </ThemeProvider>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dm/dashboard/*"
              element={
                <PrivateRoute>
                  <ThemeProvider>
                    <DMDashboard />
                  </ThemeProvider>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
};

export default App;
