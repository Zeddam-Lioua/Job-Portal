import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Row,
  Col,
  Card,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { ThreeDots } from "react-bootstrap-icons";
import hrService from "../../services/hr.service";
import PerformanceOctagon from "./PerformanceOctagon";
import "./styles/TalentPool.css";

const TalentCard = ({ talent, type }) => {
  const [showModal, setShowModal] = useState(false);
  const [evaluation, setEvaluation] = useState(
    talent.evaluation || {
      technical_skills: 0,
      communication: 0,
      problem_solving: 0,
      teamwork: 0,
      leadership: 0,
      adaptability: 0,
      work_ethic: 0,
      creativity: 0,
    }
  );

  useEffect(() => {
    if (talent.evaluation) {
      setEvaluation(talent.evaluation);
    }
  }, [talent]);

  const calculateAverageRating = (evaluationData) => {
    if (!evaluationData) return 0;
    const scores = Object.values(evaluationData);
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const handleEvaluationSave = async (newEvaluation) => {
    try {
      await hrService.savePerformanceEvaluation(talent.id, newEvaluation);
      setEvaluation(newEvaluation);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving evaluation:", error);
    }
  };

  const handleViewResume = () => {
    if (talent.resume_file) {
      window.open(talent.resume_file, "_blank");
    }
  };

  const averageRating = calculateAverageRating(evaluation);

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        {/* Top section - Basic Info */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Card.Title>
            {talent.first_name} {talent.last_name}
          </Card.Title>
          <div className="d-flex align-items-center gap-3">
            <span
              className={`badge bg-${
                averageRating >= 7
                  ? "success"
                  : averageRating >= 5
                  ? "warning"
                  : "danger"
              } fs-5`}
            >
              {averageRating}/10
            </span>
            <Dropdown align="end">
              <Dropdown.Toggle as="div" className="cursor-pointer">
                <ThreeDots size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleViewResume}>
                  View Resume
                </Dropdown.Item>
                {type === "candidate" && (
                  <Dropdown.Item
                    onClick={() =>
                      hrService.updateApplicantStatus(
                        talent.id,
                        "super_candidate"
                      )
                    }
                  >
                    Promote to Super Candidate
                  </Dropdown.Item>
                )}
                {type === "super_candidate" && (
                  <Dropdown.Item
                    onClick={() =>
                      hrService.updateApplicantStatus(talent.id, "hiree")
                    }
                  >
                    Promote to Hiree
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Card.Text as="div">
          <Row>
            <Col md={6}>
              <div className="mb-2">
                <strong>Email:</strong> {talent.email}
              </div>
              <div className="mb-2">
                <strong>Phone:</strong> {talent.phone}
              </div>
              <div className="mb-2">
                <strong>Job Applied:</strong> {talent.job_post_name}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Status:</strong> {talent.status}
              </div>
              <div className="mb-2">
                <strong>Applied Date:</strong>{" "}
                {new Date(talent.created_at).toLocaleDateString()}
              </div>
              {talent.hired_date && (
                <div className="mb-2">
                  <strong>Hired Date:</strong>{" "}
                  {new Date(talent.hired_date).toLocaleDateString()}
                </div>
              )}
            </Col>
          </Row>
        </Card.Text>

        <hr className="my-4" />

        {/* Bottom section - Performance */}
        <Row>
          <Col md={4}>
            <div className="performance-scores">
              {Object.entries(evaluation).map(([field, value], index) => (
                <div key={field} className="score-item">
                  <span className="score-label">
                    <span className="skill-number">{index + 1}.</span>{" "}
                    {field
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                  <span
                    className={`score-value ${
                      value >= 7 ? "high" : value >= 5 ? "medium" : "low"
                    }`}
                  >
                    {value}/10
                  </span>
                </div>
              ))}
            </div>
          </Col>
          <Col md={8}>
            <div className="radar-container" onClick={() => setShowModal(true)}>
              <PerformanceOctagon
                applicantId={talent.id}
                initialData={evaluation}
                readOnly={true}
                hideLabels={true}
                hideScores={true}
              />
            </div>
          </Col>
        </Row>

        {/* Evaluation Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Performance Evaluation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PerformanceOctagon
              applicantId={talent.id}
              initialData={evaluation}
              onSave={handleEvaluationSave}
            />
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

const TalentList = ({ talents, type }) => {
  if (!talents.length) {
    return (
      <Card className="text-center p-4">
        <Card.Text>No {type.replace("_", " ")}s found.</Card.Text>
      </Card>
    );
  }

  return (
    <Row className="g-4">
      {talents.map((talent) => (
        <Col md={12} key={talent.id}>
          <TalentCard talent={talent} type={type} />
        </Col>
      ))}
    </Row>
  );
};

const TalentPool = () => {
  const [talents, setTalents] = useState({
    candidates: [],
    superCandidates: [],
    hirees: [],
  });

  const fetchTalents = async () => {
    try {
      const response = await hrService.getTalentPool();
      // Make sure the evaluation data is included in the response
      setTalents(response.data);
    } catch (error) {
      console.error("Error fetching talents:", error);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  return (
    <Container className="talent-pool-container">
      <h2 className="mb-4">Talent Pool</h2>
      <Tabs defaultActiveKey="candidates" className="mb-4 theme-tabs">
        <Tab eventKey="candidates" title="Candidates">
          <TalentList talents={talents.candidates} type="candidate" />
        </Tab>
        <Tab eventKey="superCandidates" title="Super Candidates">
          <TalentList
            talents={talents.superCandidates}
            type="super_candidate"
          />
        </Tab>
        <Tab eventKey="hirees" title="Hirees">
          <TalentList talents={talents.hirees} type="hiree" />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default TalentPool;
