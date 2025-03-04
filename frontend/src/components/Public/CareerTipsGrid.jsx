import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faHandshake,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const CareerTipsGrid = () => {
  const tips = [
    {
      icon: faLightbulb,
      title: "Interview Preparation",
      content:
        "Learn how to ace your interviews with our comprehensive preparation guide.",
      color: "#FF6B6B",
    },
    {
      icon: faHandshake,
      title: "Professional Development",
      content: "Discover opportunities for growth and advancement at Faderco.",
      color: "#4ECDC4",
    },
    {
      icon: faStar,
      title: "Success Stories",
      content:
        "Read inspiring stories from our employees who built their careers with us.",
      color: "#45B7D1",
    },
  ];

  return (
    <Row className="g-4">
      {tips.map((tip, index) => (
        <Col md={4} key={index}>
          <Card className="h-100 career-tip-card border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div
                className="icon-circle mb-3 mx-auto"
                style={{ backgroundColor: `${tip.color}15` }}
              >
                <FontAwesomeIcon
                  icon={tip.icon}
                  size="2x"
                  style={{ color: tip.color }}
                />
              </div>
              <Card.Title>{tip.title}</Card.Title>
              <Card.Text className="text-muted">{tip.content}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CareerTipsGrid;
