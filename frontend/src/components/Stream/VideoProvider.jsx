import React, { useEffect, useState, useRef } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import streamService from "../../services/stream.service";
import { STREAM_VIDEO_API_KEY } from "../../config/stream";

const VideoProvider = ({ children, userId, roomId }) => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get token from backend
        const { token, call_cid } = await streamService.generateVideoToken(
          userId,
          roomId
        );

        // Create user object
        const user = {
          id: userId,
          name: userId,
          image: `https://getstream.io/random_svg/?name=${userId}`,
        };

        // Check if client already exists
        if (!clientRef.current) {
          clientRef.current = StreamVideoClient.getOrCreateInstance({
            apiKey: STREAM_VIDEO_API_KEY,
            token,
            user,
            options: {
              reconnection: true,
              timeout: 30000, // Increased timeout
              ws: {
                reconnect: true,
                reconnectionDelay: 2000,
              },
            },
          });
        }

        // Connect user only if not already connected
        if (!clientRef.current.user) {
          await clientRef.current.connectUser(user, token);
        }

        // Create and join call
        const callInstance = clientRef.current.call("default", roomId);
        await callInstance.join({ create: true });

        setClient(clientRef.current);
        setCall(callInstance);
      } catch (err) {
        console.error("Video initialization error:", err);
        setError(err.message || "Failed to initialize video call");
      }
    };

    initializeCall();

    return () => {
      const cleanup = async () => {
        try {
          if (call) {
            await call.leave();
          }
          if (clientRef.current?.user) {
            await clientRef.current.disconnectUser();
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [userId, roomId]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!client || !call) {
    return <div className="loading-message">Initializing video call...</div>;
  }

  return React.Children.map(children, (child) =>
    React.cloneElement(child, { client, call })
  );
};

export default VideoProvider;
