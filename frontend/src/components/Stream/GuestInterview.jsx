import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoCall from "./VideoCall";
import { v4 as uuidv4 } from "uuid";

const GuestInterview = () => {
  const { roomId } = useParams();
  const [error, setError] = useState(null);
  const guestUserId = `guest_${uuidv4()}`; // Generate unique guest ID

  useEffect(() => {
    // Verify interview exists
    const verifyInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/join/${roomId}`);
        if (!response.ok) {
          throw new Error("Interview not found");
        }
      } catch (err) {
        setError("Unable to join interview");
      }
    };

    verifyInterview();
  }, [roomId]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="guest-interview">
      <VideoCall userId={guestUserId} roomId={roomId} isGuest={true} />
    </div>
  );
};

export default GuestInterview;
