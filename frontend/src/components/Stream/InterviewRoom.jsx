import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatStreamUserId } from "../../utils/streamUtils";
import { Container, Button, Row, Col } from "react-bootstrap";
import VideoCall from "./VideoCall";
import ChatRoom from "./ChatRoom";

const InterviewRoom = () => {
  const { roomName } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.email ? formatStreamUserId(user.email) : null;

  if (!currentUserId) {
    return <div>Loading user information...</div>;
  }

  return (
    <Container fluid className="interview-room p-0">
      <Row className="g-0">
        <Col>
          <VideoCall userId={currentUserId} roomId={roomName} />
        </Col>

        <Col md={3}>
          <ChatRoom userId={currentUserId} channelId={roomName} />
        </Col>
      </Row>
    </Container>
  );
};

export default InterviewRoom;
