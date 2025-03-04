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
import Home from "./components/Public/Home";
import JobList from "./components/Public/JobList";
import About from "./components/Public/About";
import CareerResources from "./components/Public/CareerResources";
import Contact from "./components/Public/Contact";
import PrivateRoute from "./components/Auth/PrivateRoute";
import JobApplication from "./components/Public/JobApplication";
import OTPVerification from "./components/Auth/OTPVerification";
import InterviewRoom from "./components/Stream/InterviewRoom";
import GuestInterview from "./components/Stream/GuestInterview";
import InterviewEnded from "./components/Stream/InterviewEnded";
import GoogleCallback from "./components/Auth/GoogleCallback";
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import "./App.css";

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const App = () => {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="190055214049-gojlcmlfhpam7bg8sfvjelevfa30dl8d.apps.googleusercontent.com">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job-list" element={<JobList />} />
            <Route path="/about" element={<About />} />
            <Route path="/career-resources" element={<CareerResources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Navigate to="/admin/login" />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/register" element={<Register />} />
            <Route path="/admin/verify-otp" element={<OTPVerification />} />
            <Route path="/apply/:id" element={<JobApplication />} />
            <Route
              path="/guest/interview/:roomId"
              element={<GuestInterview />}
            />
            <Route path="/interview-ended" element={<InterviewEnded />} />
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
            <Route path="/oauth/google" element={<GoogleCallback />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
};

export default App;
