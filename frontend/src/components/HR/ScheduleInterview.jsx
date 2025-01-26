import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./styles/Interview.css";

const ScheduleInterview = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createNewInterview = () => {
    const newRoomId = `interview-${Date.now()}`;
    setRoomId(newRoomId);
    navigate(`/admin/hr/dashboard/interview/${newRoomId}`);
  };

  return (
    <Container className="interview-platform py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Interview Platform</h2>
          <Row>
            <Col md={6} lg={4} className="mb-4">
              <Card className="interview-card">
                <Card.Body>
                  <Card.Title>Create New Interview</Card.Title>
                  <Card.Text>
                    Start a new interview session and get a shareable link for
                    candidates.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={createNewInterview}
                    className="w-100"
                  >
                    Create Interview Room
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ScheduleInterview;
