import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarPlus,
  faVideo,
  faVideoCamera,
  faRecordVinyl,
  faClock,
  faUserCog,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import hrService from "../../services/hr.service";
import "./styles/Interview.css";

const Interviews = () => {
  const [roomId, setRoomId] = useState("");
  const [email, setEmail] = useState("");
  const [meetings, setMeetings] = useState({ upcoming: [], previous: [] });
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingData, setMeetingData] = useState({
    candidateEmail: "",
    scheduledTime: "",
    meetingId: uuidv4(),
    status: "scheduled",
  });
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [newInterviewData, setNewInterviewData] = useState({
    candidateEmail: "",
  });
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await hrService.getApplicants();
        const applicantsData = response.data.map((applicant) => ({
          id: applicant.id || applicant.email,
          email: applicant.email,
          name: applicant.applicant || applicant.email,
        }));
        setApplicants(applicantsData);
      } catch (err) {
        setError("Failed to load applicants");
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, []);

  const handleSchedule = async () => {
    try {
      if (!meetingData.candidateEmail || !meetingData.scheduledTime) {
        setError("Please fill in all required fields");
        return;
      }

      const roomName = `interview-${uuidv4()}`;

      // First schedule the interview
      const scheduleResponse = await hrService.scheduleInterview({
        email: meetingData.candidateEmail,
        meetingDate: meetingData.scheduledTime,
        roomName: roomName,
      });

      if (scheduleResponse.data) {
        // Then send the invitation
        await hrService.sendInterviewInvitation({
          email: meetingData.candidateEmail,
          meetingId: roomName,
          scheduledTime: meetingData.scheduledTime,
        });

        setShowScheduleModal(false);
        navigate(`/admin/hr/dashboard/interview/${roomName}`);
      }
    } catch (err) {
      setError("Failed to schedule interview");
    }
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/admin/hr/dashboard/interview/${meetingId}`);
  };

  const createNewInterview = () => {
    setShowNewInterviewModal(true);
  };

  const handleStartNewInterview = async () => {
    try {
      if (!newInterviewData.candidateEmail) {
        setError("Please select an applicant");
        return;
      }

      const newRoomId = `interview-${uuidv4()}`;

      await hrService.sendInterviewInvitation({
        email: newInterviewData.candidateEmail,
        meetingId: newRoomId,
        scheduledTime: new Date().toISOString(),
      });

      setShowNewInterviewModal(false);
      setRoomId(newRoomId);
      navigate(`/admin/hr/dashboard/interview/${newRoomId}`);
    } catch (err) {
      setError("Failed to create interview");
    }
  };

  const handleViewRecordings = async () => {
    try {
      const recordings = await hrService.getInterviewRecordings();
      // Handle recordings display
    } catch (error) {
      setError("Failed to fetch recordings");
    }
  };

  const handleViewUpcomingMeetings = async () => {
    try {
      const response = await hrService.getUpcomingMeetings();
      setMeetings(response.data);
    } catch (error) {
      setError("Failed to fetch meetings");
    }
  };

  const handleManagePersonalRoom = async () => {
    try {
      const response = await hrService.getPersonalRoom();
      // Handle personal room management
    } catch (error) {
      setError("Failed to fetch personal room");
    }
  };

  return (
    <Container className="interview-platform py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Interview Platform</h2>
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            {/* Schedule Meeting Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                    Schedule Meeting
                  </Card.Title>
                  <Card.Text>
                    Schedule an interview and send invitation link to candidate.
                  </Card.Text>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    Schedule
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Join Meeting Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faVideo} className="me-2" />
                    Join Meeting
                  </Card.Title>
                  <Card.Text>
                    Join a scheduled interview using meeting ID.
                  </Card.Text>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => setShowJoinModal(true)}
                  >
                    Join
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* New Meeting Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faVideoCamera} className="me-2" />
                    New Meeting
                  </Card.Title>
                  <Card.Text>
                    Start an instant meeting and send invitation.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={createNewInterview}
                    className="w-100"
                  >
                    Start
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* View Recordings Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faRecordVinyl} className="me-2" />
                    View Recordings
                  </Card.Title>
                  <Card.Text>Access previous interview recordings.</Card.Text>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleViewRecordings}
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Upcoming Meetings Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Upcoming Meetings
                  </Card.Title>
                  <Card.Text>View your scheduled interviews.</Card.Text>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleViewUpcomingMeetings}
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Personal Room Card */}
            <Col>
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faUserCog} className="me-2" />
                    Personal Room
                  </Card.Title>
                  <Card.Text>
                    Create or manage your personal meeting room.
                  </Card.Text>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleManagePersonalRoom}
                  >
                    Manage
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Schedule Meeting Modal */}
      <Modal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        className="theme-responsive-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingApplicants ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Applicant</Form.Label>
                <Form.Select
                  value={meetingData.candidateEmail}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      candidateEmail: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Applicant</option>
                  {applicants && applicants.length > 0 ? (
                    applicants.map((applicant) => (
                      <option key={applicant.id} value={applicant.email}>
                        {applicant.name} ({applicant.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No applicants available</option>
                  )}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Schedule Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={meetingData.scheduledTime}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      scheduledTime: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowScheduleModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSchedule}>
            Schedule
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Join Meeting Modal */}
      <Modal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        className="theme-responsive-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Join Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Meeting ID</Form.Label>
              <Form.Control
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJoinModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleJoinMeeting(roomId)}>
            Join
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Interview Modal */}
      <Modal
        show={showNewInterviewModal}
        onHide={() => setShowNewInterviewModal(false)}
        className="theme-responsive-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Start New Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingApplicants ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Form>
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
                  required
                >
                  <option value="">Select Applicant</option>
                  {applicants?.map((applicant) => (
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
          <Button
            variant="secondary"
            onClick={() => setShowNewInterviewModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStartNewInterview}>
            Start Interview
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Interviews;
