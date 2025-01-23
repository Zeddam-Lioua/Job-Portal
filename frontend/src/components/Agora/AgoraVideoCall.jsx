import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./AgoraVideoCall.css";

const AgoraVideoCall = ({ appId, channel, callType }) => {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const client = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    const initAgora = async () => {
      client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      // Handle user published/unpublished
      client.current.on("user-published", async (user, mediaType) => {
        await client.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          const remoteContainer = document.createElement("div");
          remoteContainer.id = user.uid;
          remoteContainer.className = "video-tile remote-video";
          document.getElementById("remote-container").append(remoteContainer);
          remoteVideoTrack.play(remoteContainer);
        }
        if (mediaType === "audio") user.audioTrack.play();
      });

      client.current.on("user-unpublished", (user) => {
        const remoteContainer = document.getElementById(user.uid);
        if (remoteContainer) remoteContainer.remove();
      });

      // Join channel
      const { token } = await agoraService.generateToken(channel);
      await client.current.join(appId, channel, token);

      // Create local tracks
      let tracks;
      if (callType === "video") {
        tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      } else {
        tracks = [await AgoraRTC.createMicrophoneAudioTrack()];
      }

      // Play local video
      if (tracks[1]) {
        tracks[1].play(localVideoRef.current);
      }

      await client.current.publish(tracks);
      setLocalTracks(tracks);
    };

    initAgora();

    return () => {
      localTracks.forEach((track) => track.stop());
      client.current?.leave();
    };
  }, [appId, channel, callType]);

  return (
    <div className="video-call-container">
      <div ref={localVideoRef} className="video-tile local-video"></div>
      <div id="remote-container" className="remote-container"></div>
    </div>
  );
};

export default AgoraVideoCall;
