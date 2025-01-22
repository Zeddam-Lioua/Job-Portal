import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import hrService from "../../services/hr.service";
import { useNavigate } from "react-router-dom";

const ScheduleInterview = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await hrService.getApplicants();
        setApplicants(response.data);
      } catch (err) {
        setError("Failed to load applicants");
        console.error("Error fetching applicants:", err);
      }
    };

    fetchApplicants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const roomName = `${selectedApplicant}-${meetingDate.replace(
        /[-:]/g,
        ""
      )}`;
      await hrService.scheduleInterview({
        email: selectedApplicant,
        meetingDate,
        roomName,
      });
      setSuccess("Interview scheduled successfully!");
      navigate(`/admin/hr/dashboard/interview/${roomName}`);
    } catch (err) {
      setError("Failed to schedule interview. Please try again.");
      console.error("Error scheduling interview:", err);
    }
  };

  const handleImmediateInterview = async () => {
    try {
      const roomName = `immediate-${Date.now()}`;
      await hrService.scheduleInterview({
        email: selectedApplicant,
        meetingDate: new Date().toISOString(),
        roomName,
      });
      navigate(`/admin/hr/dashboard/interview/${roomName}`);
    } catch (err) {
      setError("Failed to host immediate interview. Please try again.");
      console.error("Error hosting immediate interview:", err);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Schedule Interview</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Applicant</Form.Label>
          <Form.Select
            value={selectedApplicant}
            onChange={(e) => setSelectedApplicant(e.target.value)}
            required
          >
            <option value="">Select an applicant</option>
            {applicants.map((applicant) => (
              <option key={applicant.email} value={applicant.email}>
                {applicant.email}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Meeting Date</Form.Label>
          <Form.Control
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Schedule Interview
        </Button>
        <Button
          variant="secondary"
          onClick={handleImmediateInterview}
          className="ms-2"
        >
          Host Immediate Interview
        </Button>
      </Form>
    </Container>
  );
};

export default ScheduleInterview;
