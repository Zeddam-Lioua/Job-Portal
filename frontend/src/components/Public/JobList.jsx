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
  Form,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faGraduationCap,
  faBuilding,
  faFileContract,
  faSearch,
  faFilter,
  faMapMarkerAlt,
  faClock,
  faUserGear,
  faTools,
  faIndustry,
  faFlask,
  faChartLine,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/Public.css";

const JobList = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    experience: "all",
    education: "all",
    workplace: "all",
    contract: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Logistics",
    "Maintenance",
    "Production",
    "Quality Control",
  ];
  const experienceLevels = [
    "Indifferent",
    "None",
    "Less than 1 year",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-10 years",
    "More than 10 years",
  ];
  const educationLevels = [
    "Indifferent",
    "High School",
    "Bac",
    "Bac +1",
    "Bac +2",
    "Bac +3",
    "Bachelor's Degree",
    "Master's Degree",
    "Ph.D.",
  ];
  const workplaceTypes = ["On Site", "Hybrid", "Remote"];
  const contractTypes = [
    "Indifferent",
    "Permanent",
    "Fixed Term",
    "Training",
    "Pre-employment",
    "Full-time",
    "Part-time",
    "Freelance",
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatText = (text) => {
    if (!text) return "";
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredJobs = jobOpenings.filter((job) => {
    return (
      (filters.search === "" ||
        job.field.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.category === "all" || job.field === filters.category) &&
      (filters.experience === "all" ||
        job.experience_level === filters.experience) &&
      (filters.education === "all" ||
        job.education_level === filters.education) &&
      (filters.workplace === "all" || job.workplace === filters.workplace) &&
      (filters.contract === "all" || job.contract_type === filters.contract)
    );
  });

  const jobFieldIcons = {
    Logistics: faIndustry,
    Maintenance: faTools,
    Production: faUserGear,
    "Quality Control": faFlask,
    Research: faChartLine,
    // Add more mappings as needed
  };

  const renderJobCard = (job) => (
    <Card className="job-card mb-4 border-0 shadow-sm hover-shadow">
      <Card.Body>
        <Row>
          <Col lg={8}>
            <div className="d-flex align-items-center mb-3">
              <div className="company-logo me-3">
                <FontAwesomeIcon
                  icon={jobFieldIcons[job.field] || faBriefcase}
                  size="2x"
                  className="text-primary"
                />
              </div>
              <div>
                <h3 className="h4 mb-1">{job.field}</h3>
              </div>
            </div>

            <div className="job-highlights mb-3">
              <Row className="g-3">
                <Col sm={12}>
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="d-flex align-items-center me-4 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-muted me-2"
                      />
                      <span>{formatText(job.workplace)}</span>
                    </div>
                    <div className="d-flex align-items-center me-4 mb-2">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="text-muted me-2"
                      />
                      <span>{formatText(job.education_level)}</span>
                    </div>
                    <div className="d-flex align-items-center me-4 mb-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-muted me-2"
                      />
                      <span>
                        {job.experience_level === "No Experience Required"
                          ? "No Experience Required"
                          : job.experience_level}
                      </span>
                    </div>
                    <div className="d-flex align-items-center me-4 mb-2">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-muted me-2"
                      />
                      <span>
                        {job.required_employees}{" "}
                        {job.required_employees === 1 ? "Post" : "Posts"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center me-4 mb-2">
                      <FontAwesomeIcon
                        icon={faFileContract}
                        className="text-muted me-2"
                      />
                      <span>{formatText(job.contract_type)}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="job-tags">
              {job.urgent && (
                <Badge bg="danger" className="me-2">
                  Urgent
                </Badge>
              )}
            </div>
          </Col>

          <Col lg={4} className="d-flex align-items-center justify-content-end">
            <Link to={`/apply/${job.id}`} className="text-decoration-none">
              <Button variant="primary" className="rounded-pill px-4">
                Apply Now
              </Button>
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="public-page py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 mb-3">Explore Career Opportunities</h1>
          <p className="lead text-muted">
            Find your perfect role at our company
          </p>
        </Col>
      </Row>

      <Card className="filter-card mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by job title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="search-input"
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faBriefcase} />
                </InputGroup.Text>
                <Form.Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={12} lg={4}>
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Advanced Filters
              </Button>
            </Col>
          </Row>

          {showFilters && (
            <Row className="mt-3 g-3">
              <Col md={6} lg={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faClock} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filters.experience}
                    onChange={(e) =>
                      handleFilterChange("experience", e.target.value)
                    }
                  >
                    <option value="all">Experience Level</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={6} lg={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filters.education}
                    onChange={(e) =>
                      handleFilterChange("education", e.target.value)
                    }
                  >
                    <option value="all">Education Level</option>
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={6} lg={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filters.workplace}
                    onChange={(e) =>
                      handleFilterChange("workplace", e.target.value)
                    }
                  >
                    <option value="all">Workplace Type</option>
                    {workplaceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={6} lg={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faFileContract} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filters.contract}
                    onChange={(e) =>
                      handleFilterChange("contract", e.target.value)
                    }
                  >
                    <option value="all">Contract Type</option>
                    {contractTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <FontAwesomeIcon
              icon={faSearch}
              size="3x"
              className="text-muted mb-3"
            />
            <h3>No matching jobs found</h3>
            <p className="text-muted">
              Try adjusting your search criteria or browse all available
              positions
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div>
          <p className="text-muted mb-4">
            Showing {filteredJobs.length} matching positions
          </p>
          {filteredJobs.map((job) => renderJobCard(job))}
        </div>
      )}
    </Container>
  );
};

export default JobList;
