// frontend/src/components/HR/Team.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import hrService from "../../services/hr.service";
import "./styles/Team.css";

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await hrService.getTeamMembers();
        console.log("API Response:", response); // Debug response
        setTeam(response.data);
      } catch (err) {
        console.log("API Error:", err.response); // Debug error
        setError("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Container fluid className="team-container p-4">
      <h2 className="mb-4">Team Members</h2>
      <Row>
        {team.map((member) => (
          <Col key={member.id} md={4} lg={3} className="mb-4">
            <Card className="team-member-card">
              <Card.Body>
                <div className="team-member__widget">
                  {member.profile_picture ? (
                    <img
                      src={
                        member.profile_picture
                          ? `http://127.0.0.1:8000${member.profile_picture}`
                          : null
                      }
                      alt={`${member.first_name} ${member.last_name}`}
                      className="team-member__pic"
                      onError={(e) => {
                        console.log("Failed to load:", e.target.src);
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="team-member__icon"
                    />
                  )}
                  <div className="team-member__info">
                    <span className="team-member__name">
                      {member.first_name} {member.last_name}
                    </span>
                    <span className="team-member__type">
                      {member.user_type}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Team;
