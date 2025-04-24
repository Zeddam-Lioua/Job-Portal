import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import dmService from "../../services/dm.service";
import "./styles/DM.css";

const CreateRequest = () => {
  const [formData, setFormData] = useState({
    field: "",
    required_employees: "",
    experience_level: "",
    education_level: "",
    workplace: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData = {
        field: formData.field,
        required_employees: parseInt(formData.required_employees),
        experience_level: formData.experience_level,
        education_level: formData.education_level,
        workplace: formData.workplace,
        status: "pending",
      };

      console.log("Sending request data:", requestData); // Debug log

      const response = await dmService.createJobRequest(requestData);
      setSuccess("Request created successfully!");
      setFormData({
        field: "",
        required_employees: "",
        experience_level: "",
        education_level: "",
        workplace: "",
      });
    } catch (err) {
      console.error("API Error Response:", err.response?.data);
      const errorMessage =
        err.response?.data?.education_level?.[0] ||
        "Failed to create request. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm form-card">
        <Card.Body>
          <Card.Title className="mb-4">Create New Request</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
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
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                className="mt-4 thin-button"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateRequest;
