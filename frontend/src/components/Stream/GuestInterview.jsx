import React, { useEffect, useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import VideoCall from "./VideoCall";
import ChatRoom from "./ChatRoom";
import "./InterviewRoom.css";

const GuestInterview = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);

  // Check if interview was already ended
  useEffect(() => {
    const isEnded =
      localStorage.getItem(`interview-${roomId}-ended`) === "true";
    if (isEnded) {
      setIsInterviewEnded(true);
    }
  }, [roomId]);

  const handleCallEnd = () => {
    setIsInterviewEnded(true);
    localStorage.setItem(`interview-${roomId}-ended`, "true");
    // Force cleanup of video and chat components
    window.location.href = "/interview-ended?guest=true";
  };

  if (isInterviewEnded) {
    return <Navigate to="/interview-ended?guest=true" replace />;
  }

  // Get all required info from URL params and decode them immediately
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get("guest_id");
  const firstName = decodeURIComponent(searchParams.get("first_name") || "");
  const lastName = decodeURIComponent(searchParams.get("last_name") || "");
  const email = decodeURIComponent(searchParams.get("email") || "");

  // Create guest info object with decoded values
  const guestInfo = {
    firstName: decodeURIComponent(firstName || ""),
    lastName: decodeURIComponent(lastName || ""),
    email: decodeURIComponent(email || ""),
    name: `${firstName} ${lastName}`.trim(),
    displayName: `${firstName} ${lastName}`.trim() || "Guest",
    userId: guestId,
  };

  useEffect(() => {
    const verifyInterview = async () => {
      try {
        console.log("Verifying interview with guestInfo:", guestInfo); // Debug log
        const response = await fetch(`/api/interviews/join/${roomId}`);
        if (!response.ok) {
          throw new Error("Interview not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error joining interview:", err);
        setError("Unable to join interview");
        setLoading(false);
      }
    };

    if (roomId) {
      verifyInterview();
    }
  }, [roomId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!guestId || !email) return <div>Invalid invitation link</div>;

  return (
    <div className="interview-room">
      <div className="video-section">
        <VideoCall
          userId={guestId}
          roomId={roomId}
          isGuest={true}
          guestInfo={guestInfo}
          displayName={guestInfo.displayName}
          onLeave={handleCallEnd}
        />
      </div>
      <div className="chat-section">
        <ChatRoom
          userId={guestId}
          roomId={roomId}
          isGuest={true}
          guestInfo={guestInfo}
          displayName={guestInfo.displayName}
        />
      </div>
    </div>
  );
};

export default GuestInterview;
