import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const UpcomingMeetingsCard = () => {
  const navigate = useNavigate();

  return (
    <Col>
      <Card className="interview-card">
        <Card.Body className="d-flex flex-column">
          <Card.Title>
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            Upcoming Meetings
          </Card.Title>
          <Card.Text className="flex-grow-1">
            View all scheduled interviews.
          </Card.Text>
          <Button
            variant="primary"
            className="w-100 mt-auto"
            onClick={() => navigate("/admin/hr/dashboard/upcoming-meetings")}
          >
            View Meetings
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default UpcomingMeetingsCard;
