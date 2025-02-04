import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faUserTie,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import PhoneInput from "./PhoneInput";

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_type: "",
    password1: "",
    password2: "",
    emailOtp: "",
    phone: "",
    phoneOtp: "",
    profilePicture: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: e.target.files[0],
    }));
  };

  const resendOTP = async () => {
    try {
      setIsLoading(true);
      await authService.register(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password1,
        formData.password2,
        formData.user_type
      );
      setSuccessMessage("New OTP sent to your email");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      switch (step) {
        case 1:
          await authService.register(
            formData.first_name,
            formData.last_name,
            formData.email,
            formData.password1,
            formData.password2,
            formData.user_type
          );
          setStep(2);
          break;

        case 2:
          await authService.verifyEmail(formData.email, formData.emailOtp);
          setStep(3);
          break;

        case 3:
          if (!formData.phoneOtp) {
            await authService.sendPhoneOTP(formData.phone, formData.email);
            setShowPhoneOTP(true);
            setSuccessMessage("OTP sent to your phone");
          } else {
            await authService.verifyPhone(formData.phone, formData.phoneOtp);
            setSuccessMessage(null); // Clear OTP success message
            setShowPhoneOTP(false); // Reset OTP input visibility
            setStep(4);
          }
          break;

        case 4:
          const formDataToSend = new FormData();
          formDataToSend.append("profile_picture", formData.profilePicture);
          formDataToSend.append("email", formData.email);

          try {
            await authService.uploadProfilePicture(formDataToSend);
            setSuccessMessage(
              "Registration successful! Redirecting to login..."
            );
            setTimeout(() => navigate("/admin/login"), 3000);
          } catch (error) {
            setError(error.message || "Failed to upload profile picture");
          }
          break;
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError(
        error.response?.data?.message || error.detail || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = ({ currentStep }) => (
    <div className="step-indicator mb-4">
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`step ${currentStep >= step ? "active" : ""}`}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1
              ? "Basic Info"
              : step === 2
              ? "Email Verification"
              : step === 3
              ? "Phone Verification"
              : "Profile Picture"}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                User Type
              </Form.Label>
              <Form.Select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                required
              >
                <option value="">Select User Type</option>
                <option value="human_resources">Human Resources</option>
                <option value="district_manager">District Manager</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </Form.Group>
          </>
        );

      case 2:
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Email Verification Code</Form.Label>
              <Form.Control
                type="text"
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                required
                placeholder="Enter verification code"
                maxLength="6"
              />
            </Form.Group>
            <Button
              variant="link"
              onClick={resendOTP}
              disabled={isLoading}
              className="w-100 mb-3"
            >
              Resend verification code
            </Button>
          </>
        );

      case 3:
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Phone Number
              </Form.Label>
              <PhoneInput
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={showPhoneOTP}
              />
            </Form.Group>

            {showPhoneOTP && (
              <Form.Group className="mb-3">
                <Form.Label>Phone Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneOtp"
                  value={formData.phoneOtp}
                  onChange={handleChange}
                  required
                  placeholder="Enter verification code"
                  maxLength="6"
                />
              </Form.Group>
            )}
          </>
        );

      case 4:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            {formData.profilePicture && (
              <img
                src={URL.createObjectURL(formData.profilePicture)}
                alt="Profile Preview"
                className="mt-3 profile-preview"
              />
            )}
          </Form.Group>
        );
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">Create Account</h2>
              <StepIndicator currentStep={step} />

              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                >
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert
                  variant="success"
                  onClose={() => setSuccessMessage(null)}
                  dismissible
                >
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {renderStepContent()}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : step === 4
                    ? "Register"
                    : "Continue"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
