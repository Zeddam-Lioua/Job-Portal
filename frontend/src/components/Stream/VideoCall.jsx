import "@stream-io/video-react-sdk/dist/css/styles.css";
import React, { useEffect } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";

import VideoProvider from "./VideoProvider";
import { useAuth } from "../../context/AuthContext";

const VideoCall = ({ userId, roomId, isGuest = false }) => {
  const { user } = useAuth();
  const isHost = !isGuest && user?.user_type === "human_resources";

  return (
    <VideoProvider userId={userId} roomId={roomId} isGuest={isGuest}>
      {({ client, call }) =>
        client && call ? (
          <StreamTheme>
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <SpeakerLayout />
                <CallControls />
              </StreamCall>
            </StreamVideo>
          </StreamTheme>
        ) : (
          <div>Loading...</div>
        )
      }
    </VideoProvider>
  );
};

export default VideoCall;
