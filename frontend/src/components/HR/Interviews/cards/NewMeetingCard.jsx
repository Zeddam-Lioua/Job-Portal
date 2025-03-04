import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";

const NewMeetingCard = ({ onStart }) => {
  return (
    <Col>
      <Card className="interview-card">
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faVideo} className="me-2" />
            Start Interview
          </Card.Title>
          <Card.Text>
            Start an instant interview session with a candidate
          </Card.Text>
          <Button variant="primary" className="w-100" onClick={onStart}>
            Start Interview
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default NewMeetingCard;
