import React, { useState, useEffect } from "react";
import {
  Link,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import JobRequests from "./JobRequests";
import JobRequestDetail from "./JobRequestDetail";
import Resumes from "./Resumes";
import ResumeDetail from "./ResumeDetail";
import JobPosts from "./JobPosts";
import JobPostDetail from "./JobPostDetail";
import Settings from "./Settings";
import AnalyticsDashboard from "./AnalyticsDashboard";
import hrService from "../../services/hr.service";
import InterviewDashboard from "./Interviews/InterviewDashboard";
import UpcomingMeetingsPage from "./Interviews/Pages/UpcomingMeetingsPage";
import RecordingsPage from "./Interviews/Pages/RecordingsPage";
import InterviewRoom from "../Stream/InterviewRoom";
import Profile from "../Profile/Profile";
import Sidebar from "../layout/Sidebar";
import TalentPool from "./TalentPool";
import Team from "./Team";

import "./styles/HRDashboard.css";

const HRDashboard = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    newApplications: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await hrService.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError("Failed to load dashboard stats");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = (route) => {
    navigate(`/admin/hr/dashboard/${route}`);
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error)
    return <div className="alert alert-danger m-3">Error: {error}</div>;

  return (
    <>
      <Sidebar />
      <div className="dashboard">
        <Routes>
          <Route path="settings" element={<Settings />} />
          <Route path="job-requests" element={<JobRequests />} />
          <Route path="job-requests/:id" element={<JobRequestDetail />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="applicants/:id" element={<ResumeDetail />} />
          <Route path="active-posts/*" element={<JobPosts />} />
          <Route path="active-posts/:id" element={<JobPostDetail />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="interviews" element={<InterviewDashboard />} />
          <Route path="/" element={<Navigate to="analytics" replace />} />
          <Route path="interview/:roomName" element={<InterviewRoom />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="team" element={<Team />} />
          <Route path="upcoming-meetings" element={<UpcomingMeetingsPage />} />
          <Route path="recordings" element={<RecordingsPage />} />
          <Route path="talent-pool" element={<TalentPool />} />
        </Routes>
      </div>
    </>
  );
};

export default HRDashboard;
