import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUsers,
  faGraduationCap,
  faMapMarkerAlt,
  faCalendarAlt,
  faUserTie,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import hrService from "../../services/hr.service";
import "./styles/JobRequest.css";

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: "pointer" }}
  >
    {children}
  </div>
));

const JobRequests = () => {
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchJobRequests();
  }, [filter, sortBy]);

  const fetchJobRequests = async () => {
    try {
      const response = await hrService.getJobRequests();
      setJobRequests(response.data);
    } catch (err) {
      setError("Failed to fetch job requests. Please try again.");
      console.error("Error fetching job requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return variants[status] || "secondary";
  };

  const handleProcessRequest = async (id, action) => {
    try {
      await hrService.processJobRequest(id, action);
      fetchJobRequests();
    } catch (err) {
      console.error(`Error processing job request (${action}):`, err);
    }
  };

  const filteredRequests = jobRequests
    .filter(
      (request) =>
        (filter === "all" || request.status === filter) &&
        (request.field?.toLowerCase().includes(search.toLowerCase()) ||
          request.district_manager_name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          "") // Add fallback for undefined values
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return new Date(a.created_at) - new Date(b.created_at);
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
          <h2 className="mb-4">Job Requests</h2>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search requests..."
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
                <option value="approved">Approved</option>
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

      {filteredRequests.length === 0 ? (
        <div className="text-center" style={{ marginTop: "50px" }}>
          <FontAwesomeIcon icon={faSearch} size="5x" />
          <h4 className="mt-3">
            <strong>There are no results for this search.</strong>
          </h4>
          <p>Try again using different parameters.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredRequests.map((request) => (
            <Col key={request.id}>
              <Card className="job-request-card h-100" data-id={request.id}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="mb-1">{request.field}</Card.Title>
                      <Card.Subtitle className="text-muted">
                        <FontAwesomeIcon icon={faUserTie} className="me-2" />
                        {request.district_manager_name}
                      </Card.Subtitle>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge
                        bg={getStatusBadgeVariant(request.status)}
                        className="me-2"
                      >
                        {request.status}
                      </Badge>
                      <Dropdown align="end">
                        <Dropdown.Toggle as={CustomToggle}>
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="custom-dropdown-menu">
                          <Dropdown.Item
                            onClick={() =>
                              handleProcessRequest(request.id, "approve")
                            }
                            className="dropdown-approve"
                          >
                            Approve
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              handleProcessRequest(request.id, "reject")
                            }
                            className="dropdown-reject"
                          >
                            Reject
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>

                  <Card.Text as="div">
                    <div className="mb-2">
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      <strong>Required:</strong> {request.required_employees}{" "}
                      employees
                    </div>
                    <div className="mb-2">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="me-2"
                      />
                      <strong>Experience:</strong> {request.experience_level}
                    </div>
                    <div className="mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                      <strong>Workplace:</strong> {request.workplace}
                    </div>
                    <div className="mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      <strong>Requested:</strong>{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </Card.Text>

                  <Link
                    to={`/admin/hr/dashboard/job-requests/${request.id}`}
                    className="btn btn-outline-primary w-100"
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

export default JobRequests;
