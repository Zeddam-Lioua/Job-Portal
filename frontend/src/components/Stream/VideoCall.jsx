import React from "react";
import {
  StreamCall,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import CallProvider from "./VideoProvider";
import { useAuth } from "../../context/AuthContext";
import "./VideoCall.css";

const VideoCall = ({ userId, roomId }) => {
  const { user } = useAuth();
  const isHost = user?.role === "HR";

  return (
    <CallProvider userId={userId} roomId={roomId}>
      <StreamCall>
        <div className="video-container">
          <div className="video-main">
            <SpeakerLayout />
            <div className="video-controls">
              <CallControls
                showAudioControls
                showVideoControls
                showScreenSharing
                showLeaveCall
                onLeaveCall={() => window.history.back()}
              />
              {isHost && (
                <CallControls
                  showDeviceControls
                  showParticipantList
                  showSettingsMenu
                />
              )}
            </div>
          </div>
        </div>
      </StreamCall>
    </CallProvider>
  );
};

export default VideoCall;
