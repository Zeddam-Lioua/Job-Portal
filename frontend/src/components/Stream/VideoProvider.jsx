import React, { useEffect, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import streamService from "../../services/stream.service";
import { STREAM_API_KEY } from "../../config/stream";

const VideoProvider = ({ children, userId, roomId }) => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        const cleanUserId = userId.replace("@", "_").replace(".", "_");
        const { token } = await streamService.generateToken(
          cleanUserId,
          roomId
        );

        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: cleanUserId,
            name: cleanUserId,
          },
          token,
        });

        const callInstance = videoClient.call("default", roomId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (err) {
        console.error("Video init error:", err);
      }
    };

    initClient();

    return () => {
      if (call) call.leave();
      if (client) client.disconnectUser();
    };
  }, [userId, roomId]);

  return children({ client, call });
};

export default VideoProvider;
