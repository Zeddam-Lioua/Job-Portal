import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";

const JoinMeetingCard = ({ onJoin }) => {
  return (
    <Col>
      <Card className="interview-card">
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faVideo} className="me-2" />
            Join Meeting
          </Card.Title>
          <Card.Text>Join an existing interview using a meeting ID.</Card.Text>
          <Button variant="primary" className="w-100" onClick={onJoin}>
            Join
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default JoinMeetingCard;
