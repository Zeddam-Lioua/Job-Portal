import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import hrService from "../../../services/hr.service";

// Import all cards
import ScheduleMeetingCard from "./cards/ScheduleMeetingCard";
import JoinMeetingCard from "./cards/JoinMeetingCard";
import NewMeetingCard from "./cards/NewMeetingCard";
import RecordingsCard from "./cards/RecordingsCard";
import PersonalRoomCard from "./cards/PersonalRoomCard";
import UpcomingMeetingsCard from "./cards/UpcomingMeetingsCard";

// Import all modals
import ScheduleMeetingModal from "./modals/ScheduleMeetingModal";
import JoinMeetingModal from "./modals/JoinMeetingModal";
import NewInterviewModal from "./modals/NewInterviewModal";

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [meetings, setMeetings] = useState({ upcoming: [] });

  useEffect(() => {
    const fetchUpcomingMeetings = async () => {
      try {
        const response = await hrService.getUpcomingMeetings();
        setMeetings(response.data);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      }
    };

    fetchUpcomingMeetings();
  }, []);

  const handleJoinMeeting = (meetingId) => {
    navigate(`/admin/hr/dashboard/interview/${meetingId}`);
  };

  const handleViewRecordings = async () => {
    try {
      const response = await hrService.getInterviewRecordings();
      // Handle recordings display logic
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    }
  };

  const handleJoinPersonalRoom = async () => {
    try {
      const response = await hrService.getPersonalRoom();
      if (response.data.room_id) {
        navigate(`/admin/hr/dashboard/interview/${response.data.room_id}`);
      }
    } catch (error) {
      console.error("Failed to join personal room:", error);
    }
  };

  return (
    <Container className="interview-platform py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Interview Platform</h2>
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            <ScheduleMeetingCard
              onSchedule={() => setShowScheduleModal(true)}
            />
            <JoinMeetingCard onJoin={() => setShowJoinModal(true)} />
            <NewMeetingCard onStart={() => setShowNewInterviewModal(true)} />
            <UpcomingMeetingsCard />
            <RecordingsCard />
            <PersonalRoomCard onJoinPersonalRoom={handleJoinPersonalRoom} />
          </Row>
        </Col>
      </Row>

      {/* Modals */}
      <ScheduleMeetingModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
      />

      <JoinMeetingModal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        onJoin={handleJoinMeeting}
      />

      <NewInterviewModal
        show={showNewInterviewModal}
        onHide={() => setShowNewInterviewModal(false)}
      />
    </Container>
  );
};

export default InterviewDashboard;
