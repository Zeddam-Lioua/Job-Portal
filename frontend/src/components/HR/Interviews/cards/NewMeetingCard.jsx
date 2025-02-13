import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const NewMeetingCard = ({ onStart }) => {
  return (
    <Col>
      <Card className="interview-card">
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faPlay} className="me-2" />
            Start New Interview
          </Card.Title>
          <Card.Text>Start an immediate interview session.</Card.Text>
          <Button variant="primary" className="w-100" onClick={onStart}>
            Start Now
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default NewMeetingCard;
