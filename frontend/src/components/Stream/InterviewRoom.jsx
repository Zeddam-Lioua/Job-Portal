import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatStreamUserId } from "../../utils/streamUtils";
import VideoCall from "./VideoCall";
import ChatRoom from "./ChatRoom";
import "./InterviewRoom.css";

const InterviewRoom = () => {
  const { roomName } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.email ? formatStreamUserId(user.email) : null;

  if (!currentUserId) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="interview-room">
      <div className="video-section">
        <VideoCall userId={currentUserId} roomId={roomName} />
      </div>
      <div className="chat-section">
        <ChatRoom userId={currentUserId} roomId={roomName} />
      </div>
    </div>
  );
};

export default InterviewRoom;
