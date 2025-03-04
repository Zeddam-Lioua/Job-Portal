import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import CreateRequest from "./CreateRequest";
import RequestList from "./RequestList";
import dmService from "../../services/dm.service";
import "./styles/DM.css";

const DMDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await dmService.getJobRequests();
        setRequests(response);
      } catch (error) {
        setError("Failed to fetch requests");
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleCardClick = (route) => {
    navigate(`/admin/dm/dashboard/${route}`);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="dm-dashboard p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="dashboard-title mb-4">DM Dashboard</h1>
          <Row>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3 mt-4"
                onClick={() => handleCardClick("create-request")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">Create New Request</h6>
                    </div>
                    <FontAwesomeIcon icon={faFileAlt} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="dashboard-stat-card mb-3 mt-4"
                onClick={() => handleCardClick("requests")}
                role="button"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted">My Requests</h6>
                      <h3>{requests.length}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Routes>
        <Route path="create-request" element={<CreateRequest />} />
        <Route path="requests" element={<RequestList requests={requests} />} />
        <Route path="/" element={<Navigate to="requests" replace />} />
      </Routes>
    </Container>
  );
};

export default DMDashboard;
