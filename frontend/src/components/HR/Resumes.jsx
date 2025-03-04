import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faBriefcase,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import hrService from "../../services/hr.service";
import "./styles/Resume.css";

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchResumes();
  }, [filter, sortBy]);

  const fetchResumes = async () => {
    try {
      const response = await hrService.getApplicants({
        status: filter,
        sort: sortBy,
      });
      setResumes(response.data);
    } catch (err) {
      setError("Failed to fetch resumes");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: "warning",
      sent: "info",
      accepted: "success",
      rejected: "danger",
    };
    return variants[status] || "secondary";
  };

  const filteredResumes = resumes.filter(
    (applicant) =>
      (filter === "all" || applicant.status === filter) &&
      ((applicant.first_name + " " + applicant.last_name)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        applicant.job_post_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedResumes = filteredResumes.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else {
      return new Date(a.created_at) - new Date(b.created_at);
    }
  });

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Resume Management</h2>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search resumes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: "38px" }}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ height: "38px" }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: "38px" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Form.Select>
            </Col>
          </Row>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {sortedResumes.length === 0 ? (
        <div className="text-center" style={{ marginTop: "50px" }}>
          <FontAwesomeIcon icon={faSearch} size="5x" />
          <h4 className="mt-3">
            <strong>There are no results for this search.</strong>
          </h4>
          <p>Try again using different parameters.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {sortedResumes.map((applicant) => (
            <Col key={applicant.id}>
              <Card className="resume-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="mb-1">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        {`${applicant.first_name || ""} ${
                          applicant.last_name || ""
                        }`}
                      </Card.Title>
                      <Card.Subtitle className="text-muted">
                        <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                        {applicant.job_post_name || "No Job Post"}
                      </Card.Subtitle>
                    </div>
                    <Badge bg={getStatusBadgeVariant(applicant.status)}>
                      {applicant.status}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-3">
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Applied:{" "}
                    {applicant.created_at
                      ? new Date(applicant.created_at).toLocaleDateString()
                      : "Date not available"}
                  </Card.Text>
                  <Link
                    to={`/admin/hr/dashboard/applicants/${applicant.id}`}
                    className="mt-4 btn btn-outline-primary w-100"
                  >
                    View Details
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

export default Resumes;
