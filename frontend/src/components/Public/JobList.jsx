import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faGraduationCap,
  faBuilding,
  faFileContract,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/Public.css";

const JobList = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/job-posts/");
        setJobOpenings(response.data);
      } catch (error) {
        console.error("Error fetching job openings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobOpenings.filter((job) =>
    job.field.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container className="public-page">
      <h1 className="mb-4 text-center">Available Job Openings</h1>
      <Row className="mb-4">
        <Col md={6}>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control form-control-lg mb-3"
          />
        </Col>
      </Row>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center" style={{ marginTop: "50px" }}>
          <FontAwesomeIcon icon={faSearch} size="5x" />
          <h4 className="mt-3">
            <strong>There are no results for this search.</strong>
          </h4>
          <p>Try again using different parameters.</p>
        </div>
      ) : (
        <Row className="job-list">
          {filteredJobs.map((job) => (
            <Col md={12} key={job.id} className="mb-4">
              <Card className="wide-card p-4">
                <Card.Body>
                  <Card.Title className="fs-3 fw-bold mb-3">
                    {job.field}
                  </Card.Title>
                  <Row className="mb-3">
                    <Col xs={3} className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="me-2 text-muted"
                      />
                      {job.education_level}
                    </Col>
                    <Col xs={3} className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="me-2 text-muted"
                      />
                      {job.workplace}
                    </Col>
                    <Col xs={3} className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="me-2 text-muted"
                      />
                      {job.experience_level}
                    </Col>
                    <Col xs={3} className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faFileContract}
                        className="me-2 text-muted"
                      />
                      {job.required_employees} Posts
                    </Col>
                  </Row>
                  <hr className="my-3" />
                  <Row>
                    <Col className="d-flex justify-content-end">
                      <Link
                        to={`/apply/${job.id}`}
                        className="text-decoration-none"
                      >
                        <Button variant="primary" className="rounded-pill px-4">
                          Apply Now
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default JobList;
