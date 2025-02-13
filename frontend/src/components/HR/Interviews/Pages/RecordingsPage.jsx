import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import hrService from "../../../../services/hr.service";

const RecordingsPage = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await hrService.getInterviewRecordings();
        // Split recordings into recent (last 7 days) and previous
        const allRecordings = response.data || [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

        const recent = allRecordings.filter(
          (rec) => new Date(rec.created_at) >= sevenDaysAgo
        );
        const previous = allRecordings.filter(
          (rec) => new Date(rec.created_at) < sevenDaysAgo
        );

        setRecordings({ recent, previous });
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
        setError("Failed to load recordings");
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const EmptyState = () => (
    <Col className="text-center my-5">
      <FontAwesomeIcon
        icon={faVideo}
        style={{
          fontSize: "5rem",
          color: "#6c757d",
          marginBottom: "1rem",
        }}
      />
      <h4 className="text-muted">No Recordings Available</h4>
      <p className="text-muted">
        There are no interview recordings to display at this time.
      </p>
    </Col>
  );

  const RecordingCard = ({ recording }) => (
    <Col md={6} lg={4} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>{recording.candidate_email}</Card.Title>
          <Card.Text>
            Recorded on: {new Date(recording.created_at).toLocaleString()}
          </Card.Text>
          <Button
            variant="primary"
            onClick={() => window.open(recording.video_url, "_blank")}
          >
            Watch Recording
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading)
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );

  if (error)
    return (
      <Container className="py-4">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Interview Recordings</h2>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/hr/dashboard/interviews")}
        >
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultActiveKey="recent" className="mb-4">
        <Tab eventKey="recent" title="Recent Recordings">
          <Row className="mt-3">
            {recordings?.recent?.length > 0 ? (
              recordings.recent.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))
            ) : (
              <EmptyState />
            )}
          </Row>
        </Tab>
        <Tab eventKey="previous" title="Previous Recordings">
          <Row className="mt-3">
            {recordings?.previous?.length > 0 ? (
              recordings.previous.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))
            ) : (
              <EmptyState />
            )}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default RecordingsPage;
