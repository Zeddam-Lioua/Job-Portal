import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faGraduationCap,
  faMapMarkerAlt,
  faFileContract,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await api.get("/job-posts/");
        // Get only the first 3 active jobs
        setJobs(response.data.filter((job) => job.is_active).slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
      }
    };
    fetchFeaturedJobs();
  }, []);

  return (
    <Row className="g-4">
      {jobs.map((job) => (
        <Col md={4} key={job.id}>
          <Card className="h-100 feature-card shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">{job.field}</Card.Title>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="me-2 text-primary"
                  />
                  <span>{job.education_level}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="me-2 text-primary"
                  />
                  <span>{job.workplace}</span>
                </div>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faFileContract}
                    className="me-2 text-primary"
                  />
                  <span>{job.contract_type}</span>
                </div>
              </div>
              <Link to={`/apply/${job.id}`} className="text-decoration-none">
                <Button variant="outline-primary" className="w-100">
                  Apply Now
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default FeaturedJobs;
