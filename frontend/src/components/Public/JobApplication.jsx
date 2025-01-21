// frontend/src/components/Public/JobApplication.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import "./styles/Public.css";
import PhoneInput from "../Auth/PhoneInput";

const JobApplication = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    applicant: "",
    email: "",
    phone: "",
    resume_file: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, resume_file: file });
    } else {
      setError("Invalid file type. Only PDF files are allowed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("applicant", formData.applicant);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("resume_file", formData.resume_file);
    formDataToSend.append("job_post", id);

    try {
      const response = await api.post("/resume-submit/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", response.data);
      setSuccess("Application submitted successfully!");
      setFormData({
        applicant: "",
        email: "",
        phone: "",
        resume_file: null,
      });
    } catch (error) {
      console.error(
        "Error submitting application:",
        error.response?.data || error
      );
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="public-page">
      <h1 className="mb-4">Apply for Job</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Card className="shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Applicant Name</Form.Label>
              <Form.Control
                type="text"
                name="applicant"
                value={formData.applicant}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <PhoneInput
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Resume</Form.Label>
              <Form.Control
                type="file"
                name="resume_file"
                onChange={handleFileChange}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Submit Application"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JobApplication;
