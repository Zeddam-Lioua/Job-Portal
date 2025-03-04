import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import hrService from "../../../../services/hr.service";
import { useNavigate } from "react-router-dom";

const NewInterviewModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const [newInterviewData, setNewInterviewData] = useState({
    candidateEmail: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState([]);

  const handleStartInterview = async () => {
    if (!newInterviewData.candidateEmail) {
      setError("Please select an applicant");
      return;
    }

    try {
      setLoading(true);
      // Find the selected applicant
      const selectedApplicant = applicants.find(
        (a) => a.email === newInterviewData.candidateEmail
      );

      if (!selectedApplicant) {
        throw new Error("Selected applicant not found");
      }

      const formattedData = {
        candidate_email: newInterviewData.candidateEmail,
        scheduled_time: new Date().toISOString(),
        type:
          newInterviewData.type === "first"
            ? "first_interview"
            : "final_interview",
      };

      const response = await hrService.createInstantMeeting(formattedData);

      if (response.data && response.data.meeting_id) {
        await hrService.sendInterviewInvitation({
          email: selectedApplicant.email,
          meetingId: response.data.meeting_id,
          scheduledTime: new Date().toISOString(),
          first_name: selectedApplicant.first_name,
          last_name: selectedApplicant.last_name,
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

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        if (!newInterviewData.type) return;

        const response =
          newInterviewData.type === "first"
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
  }, [show, newInterviewData.type]);

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
              <Form.Label>Interview Type</Form.Label>
              <Form.Select
                value={newInterviewData.type}
                onChange={(e) => {
                  setNewInterviewData({
                    ...newInterviewData,
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
                value={newInterviewData.candidateEmail}
                onChange={(e) =>
                  setNewInterviewData({
                    ...newInterviewData,
                    candidateEmail: e.target.value,
                  })
                }
                disabled={!newInterviewData.type}
              >
                <option value="">
                  {!newInterviewData.type
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
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStartInterview}
          disabled={!newInterviewData.type || !newInterviewData.candidateEmail}
        >
          Start Interview
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewInterviewModal;
