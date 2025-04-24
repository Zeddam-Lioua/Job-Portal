import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faWrench,
  faIndustry,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const JobCategories = () => {
  const categories = [
    {
      icon: faTruck,
      title: "Logistics",
      count: 15,
      color: "#FF6B6B",
    },
    {
      icon: faWrench,
      title: "Maintenance",
      count: 8,
      color: "#4ECDC4",
    },
    {
      icon: faIndustry,
      title: "Production",
      count: 12,
      color: "#45B7D1",
    },
    {
      icon: faCheckCircle,
      title: "Quality Control",
      count: 6,
      color: "#96CEB4",
    },
  ];

  return (
    <Row className="mt-5 g-4">
      {categories.map((category, index) => (
        <Col key={index} md={6} lg={3}>
          <Link
            to={`/jobs?category=${category.title.toLowerCase()}`}
            className="text-decoration-none"
          >
            <Card className="category-card h-100 text-center py-4">
              <Card.Body>
                <div
                  className="category-icon-wrapper mb-3"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <FontAwesomeIcon
                    icon={category.icon}
                    size="2x"
                    style={{ color: category.color }}
                  />
                </div>
                <h3 className="h5 mb-2">{category.title}</h3>
                <p className="text-muted mb-0">
                  {category.count} Open Positions
                </p>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default JobCategories;
