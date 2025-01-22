import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const AgoraVideoCall = ({ appId, channel, token }) => {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const client = useRef(null);

  useEffect(() => {
    const initAgora = async () => {
      client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      client.current.on("user-published", async (user, mediaType) => {
        await client.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          const remoteVideoContainer = document.createElement("div");
          remoteVideoContainer.id = user.uid;
          document
            .getElementById("remote-container")
            .append(remoteVideoContainer);
          remoteVideoTrack.play(remoteVideoContainer);
        }
        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack.play();
        }
        setRemoteUsers((prevUsers) => [...prevUsers, user]);
      });

      client.current.on("user-unpublished", (user) => {
        const remoteVideoContainer = document.getElementById(user.uid);
        if (remoteVideoContainer) {
          remoteVideoContainer.remove();
        }
        setRemoteUsers((prevUsers) =>
          prevUsers.filter((u) => u.uid !== user.uid)
        );
      });

      await client.current.join(appId, channel, token, null);

      const [microphoneTrack, cameraTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([microphoneTrack, cameraTrack]);

      const localVideoContainer = document.getElementById("local-container");
      cameraTrack.play(localVideoContainer);
      await client.current.publish([microphoneTrack, cameraTrack]);
    };

    initAgora();

    return () => {
      localTracks.forEach((track) => track.close());
      client.current && client.current.leave();
    };
  }, [appId, channel, token]);

  return (
    <div>
      <div
        id="local-container"
        style={{ width: "100%", height: "200px" }}
      ></div>
      <div
        id="remote-container"
        style={{ width: "100%", height: "500px" }}
      ></div>
    </div>
  );
};

export default AgoraVideoCall;
