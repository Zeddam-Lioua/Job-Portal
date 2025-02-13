import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import hrService from "../../../../services/hr.service";
import DeleteMeetingModal from "../modals/DeleteMeetingModal";
import SuccessModal from "../modals/SuccessModal";

const UpcomingMeetingsPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState({ upcoming: [] });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await hrService.getUpcomingMeetings();
        console.log("Raw response:", response);

        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          setMeetings({ upcoming: response.data });
        } else {
          setMeetings(response.data || { upcoming: [] });
        }

        console.log("Processed meetings:", meetings);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
        setMeetings({ upcoming: [] });
      }
    };

    fetchMeetings();
  }, []);

  const handleStartMeeting = (meeting) => {
    navigate(`/admin/hr/dashboard/interview/${meeting.meeting_id}`);
  };

  // Updated to show delete modal
  const handleCancelMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDeleteModal(true);
  };

  const confirmCancelMeeting = async () => {
    try {
      await hrService.cancelMeeting(selectedMeeting.meeting_id);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      // Refresh meetings list
      const response = await hrService.getUpcomingMeetings();
      setMeetings(response.data || { upcoming: [] });
    } catch (error) {
      console.error("Failed to cancel meeting:", error);
    }
  };

  return (
    <>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-light">Upcoming Meetings</h2>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/hr/dashboard/interviews")}
          >
            Back to Dashboard
          </Button>
        </div>

        <Row>
          {meetings?.upcoming && meetings.upcoming.length > 0 ? (
            meetings.upcoming.map((meeting) => (
              <Col md={6} lg={4} key={meeting.meeting_id} className="mb-4">
                <Card className="theme-responsive-card">
                  <Card.Body>
                    <Card.Title>{meeting.candidate_email}</Card.Title>
                    <Card.Text>
                      Scheduled for:{" "}
                      {new Date(meeting.scheduled_time).toLocaleString()}
                    </Card.Text>
                    <Card.Text>
                      Status: <span className="text-primary">Scheduled</span>
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleStartMeeting(meeting)}
                      >
                        Start Meeting
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleCancelMeeting(meeting)}
                      >
                        Cancel Meeting
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col className="text-center my-5">
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{
                  fontSize: "5rem",
                  color: "#28a745",
                  marginBottom: "1rem",
                }}
              />
              <h4 className="text-success">No Meetings Scheduled</h4>
              <p className="text-muted">
                You're all caught up! No upcoming meetings at the moment.
              </p>
            </Col>
          )}
        </Row>
      </Container>
      <DeleteMeetingModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmCancelMeeting}
        meetingDetails={selectedMeeting}
      />

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        message="Interview has been successfully cancelled"
      />
    </>
  );
};

export default UpcomingMeetingsPage;
