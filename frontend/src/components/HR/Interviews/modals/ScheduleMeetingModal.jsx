import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import hrService from "../../../../services/hr.service";
import { useNavigate } from "react-router-dom";
import ScheduleSuccessModal from "./ScheduleSuccessModal";
import "../styles/ThemeResponsive.css";

const ScheduleMeetingModal = ({ show, onHide }) => {
  const navigate = useNavigate(); // Initialize navigate
  const [meetingData, setMeetingData] = useState({
    candidateEmail: "",
    scheduledTime: "",
  });
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await hrService.getApplicants();
        setApplicants(response.data);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      }
    };

    if (show) {
      fetchApplicants();
    }
  }, [show]);

  const handleSchedule = async () => {
    if (!meetingData.candidateEmail || !meetingData.scheduledTime) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        candidate_email: meetingData.candidateEmail,
        scheduled_time: new Date(meetingData.scheduledTime).toISOString(),
        type: "scheduled",
      };

      const response = await hrService.scheduleInterview(formattedData);

      if (response.data && response.data.meeting_id) {
        // Send initial notification without meeting link
        await hrService.sendScheduleNotification({
          email: meetingData.candidateEmail,
          scheduledTime: meetingData.scheduledTime,
        });

        setShowSuccessModal(true);
        onHide(); // Close the schedule form modal
      }
    } catch (err) {
      console.error("Schedule error:", err);
      setError(err.response?.data?.error || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} className="theme-responsive-modal">
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
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
                  value={meetingData.candidateEmail}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
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
              <Form.Group className="mb-3">
                <Form.Label>Schedule Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={meetingData.scheduledTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      scheduledTime: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSchedule}>
            Schedule
          </Button>
        </Modal.Footer>
      </Modal>
      <ScheduleSuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        scheduledTime={meetingData.scheduledTime}
      />
    </>
  );
};

export default ScheduleMeetingModal;
