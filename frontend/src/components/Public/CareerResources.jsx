// src/components/Public/CareerResources.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faLightbulb,
  faChartLine,
  faHandshake,
  faGraduationCap,
  faBriefcase,
  faBuilding,
  faIndustry,
  faClock,
  faCheck,
  faTools,
  faFlask,
  faUsers,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

const CareerResources = () => {
  const resources = [
    {
      title: "Interview Tips",
      icon: faLightbulb,
      content: "Master the art of interviewing with our comprehensive guide.",
      link: "/resources/interview-tips",
    },
    {
      title: "Career Growth",
      icon: faChartLine,
      content: "Explore career paths and growth opportunities at Faderco.",
      link: "/resources/career-growth",
    },
    {
      title: "Industry Insights",
      icon: faIndustry,
      content: "Stay updated with the latest trends in the hygiene industry.",
      link: "/resources/industry-insights",
    },
  ];

  const learningPaths = [
    {
      title: "Manufacturing Operations",
      icon: faTools,
      duration: "6 months",
      level: "Entry Level",
      description:
        "Learn the fundamentals of hygiene product manufacturing at Faderco.",
      topics: [
        "Production Line Operations",
        "Quality Control Standards",
        "Safety Protocols",
        "Basic Machine Operation",
      ],
    },
    {
      title: "Research & Development",
      icon: faFlask,
      duration: "12 months",
      level: "Advanced",
      description:
        "Join our R&D team and drive innovation in hygiene products.",
      topics: [
        "Product Innovation",
        "Material Science",
        "Testing Methodologies",
        "Regulatory Compliance",
      ],
    },
    {
      title: "Team Leadership",
      icon: faUsers,
      duration: "9 months",
      level: "Intermediate",
      description: "Develop essential leadership skills for supervisory roles.",
      topics: [
        "Team Management",
        "Communication Skills",
        "Performance Evaluation",
        "Conflict Resolution",
      ],
    },
    {
      title: "Process Automation",
      icon: faCode,
      duration: "8 months",
      level: "Intermediate",
      description: "Master modern automation techniques in manufacturing.",
      topics: [
        "PLC Programming",
        "Industrial Automation",
        "System Integration",
        "Maintenance Protocols",
      ],
    },
  ];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-gradient">Career Resources</h1>
        <p className="lead">Your Guide to Professional Success at Faderco</p>
      </div>

      <Row className="g-4 mb-5">
        {resources.map((resource, index) => (
          <Col md={4} key={index}>
            <Card className="resource-card h-100 border-0 shadow-hover">
              <Card.Body className="p-4">
                <div className="icon-circle mb-3">
                  <FontAwesomeIcon
                    icon={resource.icon}
                    className="text-primary"
                    size="2x"
                  />
                </div>
                <h3 className="h4 mb-3">{resource.title}</h3>
                <p className="text-muted">{resource.content}</p>
                <Button variant="outline-primary" className="mt-3">
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <section className="learning-paths mb-5">
        <h2 className="text-center mb-4">Learning Paths</h2>
        <Row className="g-4">
          {learningPaths.map((path, index) => (
            <Col md={6} key={index} className="mb-4">
              <Card className="learning-path-card h-100 border-0 shadow-hover">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="path-icon-circle me-3">
                      <FontAwesomeIcon
                        icon={path.icon}
                        className="text-primary"
                        size="2x"
                      />
                    </div>
                    <div>
                      <h3 className="h4 mb-1">{path.title}</h3>
                      <div className="text-muted small">
                        <span className="me-3">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {path.duration}
                        </span>
                        <span>
                          <FontAwesomeIcon
                            icon={faChartLine}
                            className="me-1"
                          />
                          {path.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted mb-4">{path.description}</p>
                  <div className="topics-list">
                    <h6 className="mb-3">Key Topics:</h6>
                    <ul className="list-unstyled">
                      {path.topics.map((topic, i) => (
                        <li key={i} className="mb-2">
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="text-success me-2"
                          />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline-primary" className="mt-3 w-100">
                    Explore Path
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
};

export default CareerResources;
