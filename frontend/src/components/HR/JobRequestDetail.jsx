import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import hrService from "../../services/hr.service";
import "./styles/JobRequest.css";

const JobRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobRequest, setJobRequest] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    field: "",
    required_employees: "",
    experience_level: "",
    education_level: "",
    workplace: "",
    contract_type: "",
    is_active: false,
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchJobRequest = async () => {
      try {
        const response = await hrService.getJobRequest(id);
        setJobRequest(response.data);
        setFormData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Job request not found.");
        } else {
          setError("Failed to fetch job request. Please try again.");
        }
        console.error("Error fetching job request:", err);
      }
    };

    fetchJobRequest();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await hrService.updateJobRequest(id, formData);
      alert("Job request updated successfully!");
      navigate("/admin/hr/dashboard/job-requests");
    } catch (err) {
      setError("Failed to update job request. Please try again.");
      console.error("Error updating job request:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job request?")) {
      try {
        await hrService.deleteJobRequest(id);
        alert("Job request deleted successfully!");
        navigate("/admin/hr/dashboard/job-requests");
      } catch (err) {
        setError("Failed to delete job request. Please try again.");
        console.error("Error deleting job request:", err);
      }
    }
  };

  const handleProcessRequest = async (action) => {
    setProcessing(true);
    try {
      await hrService.processJobRequest(id, action);
      alert(`Job request ${action} successfully!`);
      navigate("/admin/hr/dashboard/job-requests");
    } catch (err) {
      setError(`Failed to ${action} job request. Please try again.`);
      console.error(`Error processing job request:`, err);
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!jobRequest) {
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
    <Container className="py-4">
      <Card className="detail-card shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-4">
            Edit Job Request
          </Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="form-container">
            <Form.Group className="mb-3">
              <Form.Label>Field</Form.Label>
              <Form.Control
                type="text"
                name="field"
                value={formData.field}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Required Employees</Form.Label>
              <Form.Control
                type="number"
                name="required_employees"
                value={formData.required_employees}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Experience Level</Form.Label>
              <Form.Select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                required
              >
                <option value="">Select Experience Level</option>
                <option value="indifferent">Indifferent</option>
                <option value="None">None</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2-3 years">2-3 years</option>
                <option value="3-4 years">3-4 years</option>
                <option value="4-5 years">4-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="More than 10 years">More than 10 years</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Education Level</Form.Label>
              <Form.Select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                required
              >
                <option value="">Select Education Level</option>
                <option value="indifferent">Indifferent</option>
                <option value="high_school">High School</option>
                <option value="bac">Bac</option>
                <option value="bac+1">Bac +1</option>
                <option value="bac+2">Bac +2</option>
                <option value="bac+3">Bac +3</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">Ph.D.</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Workplace</Form.Label>
              <Form.Select
                name="workplace"
                value={formData.workplace}
                onChange={handleChange}
                required
              >
                <option value="">Select Workplace</option>
                <option value="on_site">On Site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contract Type</Form.Label>
              <Form.Select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                required
              >
                <option value="indifferent">Indifferent</option>
                <option value="permanent">Permanent</option>
                <option value="fixed_term">Fixed Term</option>
                <option value="training">Training</option>
                <option value="pre_employment">Pre-employment</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="freelance">Freelance</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                required
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid gap-2 mt-4">
              <Button variant="primary" type="submit" className="thin-button">
                Update Job Request
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="thin-button"
              >
                Delete Job Request
              </Button>
              <Button
                variant="success"
                onClick={() => handleProcessRequest("approve")}
                className="thin-button"
                disabled={processing}
              >
                Approve Job Request
              </Button>
              <Button
                variant="warning"
                onClick={() => handleProcessRequest("reject")}
                className="thin-button"
                disabled={processing}
              >
                Reject Job Request
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JobRequestDetail;
