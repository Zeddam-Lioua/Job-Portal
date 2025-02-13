import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import hrService from "../../../../services/hr.service";
import { useNavigate } from "react-router-dom";

const NewInterviewModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const [newInterviewData, setNewInterviewData] = useState({
    candidateEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await hrService.getApplicants();
        setApplicants(response.data || []);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      }
    };

    if (show) {
      fetchApplicants();
    }
  }, [show]);

  const handleStartInterview = async () => {
    if (!newInterviewData.candidateEmail) {
      setError("Please select an applicant");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        candidate_email: newInterviewData.candidateEmail,
        scheduled_time: new Date().toISOString(),
        type: "instant",
      };

      console.log("Creating instant meeting with data:", formattedData);
      const response = await hrService.createInstantMeeting(formattedData);

      if (response.data && response.data.meeting_id) {
        await hrService.sendInterviewInvitation({
          email: newInterviewData.candidateEmail,
          meetingId: response.data.meeting_id,
          scheduledTime: new Date().toISOString(),
        });
        onHide();
        navigate(`/admin/hr/dashboard/interview/${response.data.meeting_id}`);
      }
    } catch (err) {
      console.error("Interview creation error:", err);
      setError(err.response?.data?.error || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} className="theme-responsive-modal">
      <Modal.Header closeButton>
        <Modal.Title>Start New Interview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Form>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Select Applicant</Form.Label>
              <Form.Select
                value={newInterviewData.candidateEmail}
                onChange={(e) =>
                  setNewInterviewData({
                    ...newInterviewData,
                    candidateEmail: e.target.value,
                  })
                }
              >
                <option value="">Select an applicant</option>
                {applicants.map((applicant) => (
                  <option key={applicant.id} value={applicant.email}>
                    {applicant.name} ({applicant.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleStartInterview}>
          Start Interview
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewInterviewModal;
