import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import VideoCall from "./VideoCall";
import GuestForm from "./GuestForm";
import ChatRoom from "./ChatRoom";
import "./InterviewRoom.css";

const GuestInterview = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestInfo, setGuestInfo] = useState(null);
  const guestId = new URLSearchParams(location.search).get("guest_id");

  useEffect(() => {
    const verifyInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/join/${roomId}`);
        if (!response.ok) {
          throw new Error("Interview not found");
        }
        setLoading(false);
      } catch (err) {
        setError("Unable to join interview");
        setLoading(false);
      }
    };
    verifyInterview();
  }, [roomId]);

  const handleGuestSubmit = (info) => {
    setGuestInfo(info);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!guestId) return <div>Invalid invitation link</div>;
  if (!guestInfo) return <GuestForm onSubmit={handleGuestSubmit} />;

  return (
    <div className="interview-room">
      <div className="video-section">
        <VideoCall
          userId={guestId}
          roomId={roomId}
          isGuest={true}
          guestInfo={guestInfo}
        />
      </div>
      <div className="chat-section">
        {guestInfo ? (
          <ChatRoom
            userId={guestId}
            roomId={roomId}
            isGuest={true}
            guestInfo={guestInfo}
          />
        ) : (
          <div>Loading chat...</div>
        )}
      </div>
    </div>
  );
};

export default GuestInterview;
