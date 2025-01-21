// frontend/src/components/HR/ResumeDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faUser,
  faEnvelope,
  faPhone,
  faBriefcase,
  faUserTie,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import hrService from "../../services/hr.service";
import "./styles/Resume.css";

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await hrService.getResume(id);
        setResume(response.data);
      } catch (err) {
        setError("Failed to load resume details");
        console.error("Error fetching resume:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      console.log(`Updating status to: ${newStatus}`);
      await hrService.updateResumeStatus(id, newStatus);
      setResume({ ...resume, status: newStatus });
      console.log(`Status updated to: ${newStatus}`);
      alert(`Resume status updated to ${newStatus}`);
      navigate("/admin/hr/dashboard/resumes"); // Navigate back to resumes list
    } catch (err) {
      setError("Failed to update status");
      console.error("Error updating status:", err);
    } finally {
      setSaving(false);
    }
  };

  const viewResume = () => {
    navigate(`/pdf-viewer?url=${encodeURIComponent(resume.resume_file)}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await hrService.deleteResume(id);
        alert("Resume deleted successfully!");
        navigate("/admin/hr/dashboard/resumes");
      } catch (err) {
        setError("Failed to delete resume. Please try again.");
        console.error("Error deleting resume:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not provided";

    // Handle old format (direct phone number)
    if (!phone.startsWith("0")) {
      return phone;
    }

    // Handle new format (0XXXXXXXXX)
    const carrier = phone.substring(0, 2); // Get carrier digit after 0
    const number = phone.substring(2); // Get remaining digits
    const formattedNumber = `${carrier}${number}`; // Format as 0X XXXXXXXX
    return formattedNumber.replace(/(\d{2})(?=\d)/g, "$1 ");
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
    <Container className="py-4">
      <Card className="detail-card shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-4">
            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
            Resume Details
          </Card.Title>

          <div className="info-group mb-4">
            <h6 className="text-muted mb-3">Applicant Information</h6>
            <p className="mb-3">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              <strong>Name:</strong> {resume?.applicant}
            </p>
            <p className="mb-3">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              <strong>Email:</strong> {resume?.email}
            </p>
            <p className="mb-3">
              <FontAwesomeIcon icon={faPhone} className="me-2" />
              <strong>Phone:</strong> {formatPhoneNumber(resume?.phone)}
            </p>
          </div>

          <div className="info-group mb-4">
            <h6 className="text-muted mb-3">Job Information</h6>
            <p className="mb-4">
              <FontAwesomeIcon icon={faBriefcase} className="me-2" />
              <strong>Job Post:</strong> {resume.job_post_name}
            </p>
            <p className="mb-4">
              <FontAwesomeIcon icon={faUserTie} className="me-2" />
              <strong>District Manager:</strong> {resume.district_manager_name}
            </p>
          </div>

          <div className="info-group mb-4">
            <h6 className="text-muted mb-3">Application Details</h6>
            <p className="mb-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              <strong>Submitted:</strong> {formatDate(resume?.created_at)}
            </p>
            <p className="mb-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              <strong>Last Updated:</strong>{" "}
              {resume?.updated_at !== resume?.created_at
                ? formatDate(resume?.updated_at)
                : "Pending"}
            </p>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={viewResume}
              className="view-resume-btn thin-button"
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              View Resume
            </Button>
            <Button
              variant="success"
              onClick={() => handleStatusChange("accepted")}
              className="accept-resume-btn thin-button"
              disabled={saving}
            >
              Accept Resume
            </Button>
            <Button
              variant="warning"
              onClick={() => handleStatusChange("rejected")}
              className="reject-resume-btn thin-button"
              disabled={saving}
            >
              Reject Resume
            </Button>
            <Button
              variant="info"
              onClick={() => handleStatusChange("contacted")}
              className="contact-resume-btn thin-button"
              disabled={saving}
            >
              Contacted
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="delete-resume-btn thin-button"
            >
              Delete Resume
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResumeDetail;
