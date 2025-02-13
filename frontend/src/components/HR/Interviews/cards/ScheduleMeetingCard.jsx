import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";

const ScheduleMeetingCard = ({ onSchedule }) => {
  return (
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
          <Button variant="primary" className="w-100" onClick={onSchedule}>
            Schedule
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ScheduleMeetingCard;
