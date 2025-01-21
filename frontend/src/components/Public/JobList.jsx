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
  Form,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faGraduationCap,
  faBuilding,
  faFileContract,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/Public.css";

const JobList = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [educationFilter, setEducationFilter] = useState("all");
  const [workplaceFilter, setWorkplaceFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");

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

  const filteredJobs = jobOpenings.filter(
    (job) =>
      job.field.toLowerCase().includes(search.toLowerCase()) &&
      (experienceFilter === "all" ||
        job.experience_level === experienceFilter) &&
      (educationFilter === "all" || job.education_level === educationFilter) &&
      (workplaceFilter === "all" || job.workplace === workplaceFilter) &&
      (contractFilter === "all" || job.contract_type === contractFilter)
  );

  return (
    <Container className="public-page">
      <h1 className="mb-4">Available Job Openings</h1>
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faFilter} />
            </InputGroup.Text>
            <Form.Select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="all">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Experience Level
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setExperienceFilter("all")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setExperienceFilter("entry")}>
                Entry Level
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setExperienceFilter("mid")}>
                Mid Level
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setExperienceFilter("senior")}>
                Senior Level
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Education Level
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setEducationFilter("all")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setEducationFilter("high_school")}>
                High School
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setEducationFilter("bachelor")}>
                Bachelor's
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setEducationFilter("master")}>
                Master's
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setEducationFilter("phd")}>
                PhD
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Workplace
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setWorkplaceFilter("all")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setWorkplaceFilter("remote")}>
                Remote
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setWorkplaceFilter("onsite")}>
                Onsite
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setWorkplaceFilter("hybrid")}>
                Hybrid
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Contract Type
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setContractFilter("all")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setContractFilter("full_time")}>
                Full Time
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setContractFilter("part_time")}>
                Part Time
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setContractFilter("contract")}>
                Contract
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setContractFilter("internship")}>
                Internship
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
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
        <Alert variant="info">
          No job openings available at the moment. Please check back later.
        </Alert>
      ) : (
        <Row className="job-list">
          {filteredJobs.map((job) => (
            <Col md={12} lg={10} key={job.id} className="mb-4 mx-auto">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{job.field}</Card.Title>
                  <Card.Text as="div">
                    <Row>
                      <Col xs={6} md={3}>
                        <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                        <strong>Experience:</strong> {job.experience_level}
                      </Col>
                      <Col xs={6} md={3}>
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className="me-2"
                        />
                        <strong>Education:</strong> {job.education_level}
                      </Col>
                      <Col xs={6} md={3}>
                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                        <strong>Workplace:</strong> {job.workplace}
                      </Col>
                      <Col xs={6} md={3}>
                        <FontAwesomeIcon
                          icon={faFileContract}
                          className="me-2"
                        />
                        <strong>Contract:</strong> {job.contract_type}
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        <strong>Needed Positions:</strong>{" "}
                        {job.required_employees}
                      </Col>
                    </Row>
                  </Card.Text>
                  <Link to={`/apply/${job.id}`}>
                    <Button variant="primary" className="w-100">
                      Apply Now
                    </Button>
                  </Link>
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
