import React from "react";
import { useParams } from "react-router-dom";
import AgoraVideoCall from "./AgoraVideoCall";

const InterviewRoom = () => {
  const { roomName } = useParams();

  return (
    <AgoraVideoCall
      appId="0191d05e615549beb20676f14e80b476"
      channel={roomName}
    />
  );
};

export default InterviewRoom;
