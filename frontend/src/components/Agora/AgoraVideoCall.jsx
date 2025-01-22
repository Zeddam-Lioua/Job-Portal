import React, { useEffect, useState } from "react";
import AgoraUIKit from "agora-react-uikit";
import agoraService from "../../services/agora.service";
import { Container, Button, Row, Col } from "react-bootstrap";
import "./AgoraVideoCall.css";

const AgoraVideoCall = ({ appId, channel }) => {
  const [rtcProps, setRtcProps] = useState({
    appId,
    channel,
    token: null,
  });
  const [isJoined, setIsJoined] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenUser, setFullscreenUser] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { token } = await agoraService.generateToken(channel);
        setRtcProps((prevProps) => ({ ...prevProps, token }));
      } catch (error) {
        console.error("Error fetching Agora token:", error);
      }
    };

    fetchToken();
  }, [channel]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { user: "Me", text: newMessage }]);
      setNewMessage("");
    }
  };

  const callbacks = {
    EndCall: () => {
      setIsJoined(false);
      window.location.href = "/admin/hr/dashboard/interviews";
    },
    UserJoined: () => {
      setIsJoined(true);
    },
    UserClicked: (user) => {
      if (fullscreenUser === user) {
        setFullscreenUser(null);
        setIsFullscreen(false);
      } else {
        setFullscreenUser(user);
        setIsFullscreen(true);
      }
    },
    ActiveSpeaker: (user) => {
      setActiveSpeaker(user);
    },
    MessageReceived: (message) => {
      setMessages([...messages, message]);
    },
  };

  return (
    <Container fluid className="video-call-container">
      <Row className="h-100">
        <Col md={isFullscreen ? 12 : 9} className="video-column">
          {rtcProps.token ? (
            <AgoraUIKit
              rtcProps={rtcProps}
              callbacks={callbacks}
              styleProps={{
                localBtnContainer: {
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                },
                remoteBtnContainer: {
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                },
                videoContainer: {
                  display: "flex",
                  flexDirection: isFullscreen ? "column" : "row",
                  width: "100%",
                  height: "100%",
                },
                localVideo: {
                  width: isFullscreen ? "100%" : "50%",
                  height: isFullscreen ? "100%" : "100%",
                  cursor: "pointer",
                  border:
                    activeSpeaker === "local" ? "2px solid #007bff" : "none",
                },
                remoteVideo: {
                  width: isFullscreen ? "100%" : "50%",
                  height: isFullscreen ? "100%" : "100%",
                  cursor: "pointer",
                  border:
                    activeSpeaker === "remote" ? "2px solid #007bff" : "none",
                },
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
          {isJoined && (
            <Button
              variant="danger"
              onClick={callbacks.EndCall}
              className="mt-3"
            >
              End Call
            </Button>
          )}
        </Col>
        {!isFullscreen && (
          <Col md={3} className="chat-column">
            <div className="chat-box">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.user}:</strong> {msg.text}
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default AgoraVideoCall;
