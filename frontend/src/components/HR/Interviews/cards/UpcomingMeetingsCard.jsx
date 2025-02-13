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
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            Upcoming Meetings
          </Card.Title>
          <Card.Text>View all scheduled interviews.</Card.Text>
          <Button
            variant="primary"
            className="w-100"
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
