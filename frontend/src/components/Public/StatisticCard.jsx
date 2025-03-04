import React from "react";
import { Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatisticCard = ({ number, text, icon }) => {
  return (
    <Col md={4}>
      <Card className="statistic-card text-center h-100 border-0 shadow-sm">
        <Card.Body>
          <div className="icon-circle mb-3 mx-auto">
            <FontAwesomeIcon icon={icon} size="2x" className="text-primary" />
          </div>
          <h3 className="display-4 fw-bold mb-2">{number}</h3>
          <p className="text-muted mb-0">{text}</p>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default StatisticCard;
