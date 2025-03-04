import "@stream-io/video-react-sdk/dist/css/styles.css";
import React from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import VideoProvider from "./VideoProvider";

const VideoCall = ({
  userId,
  roomId,
  isGuest = false,
  guestInfo,
  onLeave, // Changed from onCallEnd to onLeave
}) => {
  const handleLeave = async (call) => {
    console.log("Call left via CallControls");

    try {
      if (isGuest) {
        localStorage.setItem(`interview-${roomId}-ended`, "true");
        if (onLeave) {
          await onLeave();
        }
        await call.leave();
        window.location.replace("/interview-ended?guest=true");
      } else {
        await call.endCall();
        if (onLeave) {
          await onLeave();
        }
        window.location.replace("/admin/hr/dashboard/interviews");
      }
    } catch (error) {
      console.error("Error ending/leaving call:", error);
      // Force navigation even if there's an error
      window.location.replace(
        isGuest
          ? "/interview-ended?guest=true"
          : "/admin/hr/dashboard/interviews"
      );
    }
  };

  return (
    <VideoProvider
      userId={userId}
      roomId={roomId}
      isGuest={isGuest}
      guestInfo={guestInfo}
      onLeave={onLeave} // Changed from onCallEnd to onLeave
    >
      {({ client, call }) =>
        client && call ? (
          <StreamTheme>
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <SpeakerLayout />
                <CallControls onLeave={() => handleLeave(call)} />
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
