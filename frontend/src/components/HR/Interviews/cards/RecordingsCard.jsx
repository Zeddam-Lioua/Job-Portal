import React from "react";
import { Card, Button, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RecordingsCard = () => {
  const navigate = useNavigate();

  return (
    <Col>
      <Card className="interview-card">
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faVideo} className="me-2" />
            Interview Recordings
          </Card.Title>
          <Card.Text>Access your past interview recordings.</Card.Text>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => navigate("/admin/hr/dashboard/recordings")}
          >
            View Recordings
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default RecordingsCard;
