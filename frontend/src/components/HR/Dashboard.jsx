import React, { useState, useEffect } from "react";
import {
  Link,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Container, Row, Col, Nav, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faUsers,
  faBriefcase,
  faChartLine,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import JobRequests from "./JobRequests";
import JobRequestDetail from "./JobRequestDetail";
import Resumes from "./Resumes";
import ResumeDetail from "./ResumeDetail";
import JobPosts from "./JobPosts";
import JobPostDetail from "./JobPostDetail";
import AnalyticsDashboard from "./AnalyticsDashboard";
import hrService from "../../services/hr.service";
import VideoCall from "../Stream/VideoCall";
import ScheduleInterview from "./ScheduleInterview";
import InterviewRoom from "../Stream/InterviewRoom";
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
    <Container fluid className="hr-dashboard p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="dashboard-title mb-4">HR Dashboard</h1>
          <Row>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3"
                onClick={() => handleCardClick("job-requests")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Pending Requests</h6>
                      <h3>{stats.pendingRequests}</h3>
                    </div>
                    <FontAwesomeIcon icon={faFileAlt} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3"
                onClick={() => handleCardClick("resumes")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">New Applications</h6>
                      <h3>{stats.newApplications}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3"
                onClick={() => handleCardClick("active-posts")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Active Jobs</h6>
                      <h3>{stats.activeJobs}</h3>
                    </div>
                    <FontAwesomeIcon icon={faBriefcase} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3"
                onClick={() => handleCardClick("analytics")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Analytics</h6>
                      <h3>View</h3>
                    </div>
                    <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3"
                onClick={() => handleCardClick("interviews")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Interviews</h6>
                      <h3>Schedule</h3>
                    </div>
                    <FontAwesomeIcon icon={faVideo} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Routes>
        <Route path="job-requests" element={<JobRequests />} />
        <Route path="job-requests/:id" element={<JobRequestDetail />} />
        <Route path="resumes" element={<Resumes />} />
        <Route path="resumes/:id" element={<ResumeDetail />} />
        <Route path="active-posts" element={<JobPosts />} />
        <Route path="active-posts/:id" element={<JobPostDetail />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="interviews" element={<ScheduleInterview />} />
        <Route path="/" element={<Navigate to="job-requests" replace />} />
        <Route path="interview/:roomName" element={<InterviewRoom />} />
      </Routes>
    </Container>
  );
};

export default HRDashboard;
