import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import hrService from "../../../../services/hr.service";
import { useNavigate } from "react-router-dom";
import ScheduleSuccessModal from "./ScheduleSuccessModal";
import "../styles/ThemeResponsive.css";

const ScheduleMeetingModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState({
    candidateEmail: "",
    scheduledTime: "",
    type: "", // Add type to the state
  });
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        if (!meetingData.type) return;

        const response =
          meetingData.type === "first"
            ? await hrService.getCandidates()
            : await hrService.getSuperCandidates();

        // Make sure we have full applicant details including name
        const applicantsWithDetails = response.data.map((applicant) => ({
          ...applicant,
          first_name: applicant.first_name,
          last_name: applicant.last_name,
          email: applicant.email,
          id: applicant.id,
        }));

        setApplicants(applicantsWithDetails);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Failed to load applicants");
      }
    };

    if (show) {
      fetchCandidates();
    }
  }, [show, meetingData.type]);

  const handleSchedule = async () => {
    if (
      !meetingData.candidateEmail ||
      !meetingData.scheduledTime ||
      !meetingData.type
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      // Find the selected applicant to get their name
      const selectedApplicant = applicants.find(
        (applicant) => applicant.email === meetingData.candidateEmail
      );

      if (!selectedApplicant) {
        throw new Error("Selected applicant not found");
      }

      const formattedData = {
        candidate_email: meetingData.candidateEmail,
        scheduled_time: new Date(meetingData.scheduledTime).toISOString(),
        type:
          meetingData.type === "first" ? "first_interview" : "final_interview",
      };

      const response = await hrService.scheduleInterview(formattedData);

      if (response.data && response.data.meeting_id) {
        await hrService.sendInterviewInvitation({
          email: meetingData.candidateEmail,
          meetingId: response.data.meeting_id,
          scheduledTime: meetingData.scheduledTime,
          first_name: selectedApplicant.first_name,
          last_name: selectedApplicant.last_name,
        });

        setShowSuccessModal(true);
        onHide();
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
                <Form.Label>Interview Type</Form.Label>
                <Form.Select
                  value={meetingData.type}
                  onChange={(e) => {
                    setMeetingData({
                      ...meetingData,
                      type: e.target.value,
                      candidateEmail: "", // Reset candidate selection when type changes
                    });
                  }}
                >
                  <option value="">Select interview type</option>
                  <option value="first">First Interview</option>
                  <option value="final">Final Interview</option>
                </Form.Select>
              </Form.Group>

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
                  disabled={!meetingData.type}
                >
                  <option value="">
                    {!meetingData.type
                      ? "Please select interview type first"
                      : "Select an applicant"}
                  </option>
                  {applicants.map((applicant) => (
                    <option key={applicant.id} value={applicant.email}>
                      {`${applicant.first_name} ${applicant.last_name} (${applicant.email})`}
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
          <Button
            variant="primary"
            onClick={handleSchedule}
            disabled={
              !meetingData.type ||
              !meetingData.candidateEmail ||
              !meetingData.scheduledTime
            }
          >
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
