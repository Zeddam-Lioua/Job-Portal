import React, { useState } from "react";
import { useParams } from "react-router-dom";
import AgoraVideoCall from "./AgoraVideoCall";
import ChatRoom from "./ChatRoom";

const InterviewRoom = () => {
  const { roomName } = useParams();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callType, setCallType] = useState(null);

  const handleStartVideoCall = () => {
    setCallType("video");
    setIsCallStarted(true);
  };

  const handleStartAudioCall = () => {
    setCallType("audio");
    setIsCallStarted(true);
  };

  return (
    <div>
      {isCallStarted ? (
        <AgoraVideoCall
          appId="0191d05e615549beb20676f14e80b476"
          channel={roomName}
          callType={callType}
        />
      ) : (
        <ChatRoom
          appId="0191d05e615549beb20676f14e80b476"
          channel={roomName}
          onStartVideoCall={handleStartVideoCall}
          onStartAudioCall={handleStartAudioCall}
        />
      )}
    </div>
  );
};

export default InterviewRoom;
