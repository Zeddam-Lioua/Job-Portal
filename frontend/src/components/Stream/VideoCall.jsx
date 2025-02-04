import React, { useEffect } from "react";
import {
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import VideoProvider from "./VideoProvider";
import { useAuth } from "../../context/AuthContext";
import "./VideoCall.css";

const VideoCall = ({ userId, roomId, isGuest = false }) => {
  const { user } = useAuth();
  const isHost = !isGuest && user?.user_type === "human_resources";

  useEffect(() => {
    return () => {
      console.log("Cleaning up VideoCall...");
      // No need to explicitly leave the call here since VideoProvider handles it
    };
  }, []);

  return (
    <VideoProvider userId={userId} roomId={roomId} isGuest={isGuest}>
      {({ client, call }) =>
        client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
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
          </StreamVideo>
        ) : (
          <div>Loading...</div>
        )
      }
    </VideoProvider>
  );
};

export default VideoCall;
