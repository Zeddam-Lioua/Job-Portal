import React, { useEffect, useState } from "react";
import streamService from "../../services/stream.service";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { STREAM_API_KEY } from "../../config/stream";

const VideoProvider = ({ children, userId, roomId, isGuest = false }) => {
  const [token, setToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let tokenRefreshInterval;

    const initCall = async (videoClient) => {
      const callInstance = videoClient.call("default", roomId);
      try {
        if (!isGuest) {
          // Host creates the call and adds guest member
          await callInstance.create({
            members: [{ user_id: userId, role: "call_host" }],
          });

          // Add guest if guest_id is in URL
          const guestId = new URLSearchParams(window.location.search).get(
            "guest_id"
          );
          if (guestId) {
            await callInstance.updateCallMembers({
              update_members: [{ user_id: guestId, role: "guest" }],
            });
          }
        }

        // Join call with appropriate role
        await callInstance.join({
          create: false,
          ring: true,
          data: { role: isGuest ? "guest" : "call_host" },
        });

        return callInstance;
      } catch (err) {
        console.error("Error during call initialization:", err);
        setError("Failed to initialize call");
      }
    };

    const initToken = async () => {
      try {
        console.log("Initializing token for user:", userId);
        const cleanUserId = userId.replace("@", "_").replace(".", "_");
        const { token: streamToken } = await streamService.generateToken(
          cleanUserId,
          roomId
        );

        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: cleanUserId,
            name: cleanUserId,
          },
          token: streamToken,
        });

        const callInstance = await initCall(videoClient);
        setToken(streamToken);
        setClient(videoClient);
        setCall(callInstance);

        if (isGuest) {
          tokenRefreshInterval = setInterval(async () => {
            try {
              const { token: refreshedToken } =
                await streamService.generateToken(cleanUserId, roomId);
              setToken(refreshedToken);
              videoClient.setToken(refreshedToken);
            } catch (err) {
              console.error("Token refresh failed:", err);
            }
          }, 23 * 60 * 60 * 1000);
        }
      } catch (err) {
        setError(err.message);
        console.error("Token generation error:", err);
      }
    };

    initToken();

    return () => {
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
      if (call) {
        call
          .leave()
          .catch((err) => console.error("Failed to leave call:", err));
      }
      if (client) client.disconnectUser();
    };
  }, [userId, roomId, isGuest]);

  if (error) return <div>Error: {error}</div>;
  if (!token || !client || !call) return <div>Loading...</div>;

  return children({ client, call });
};

export default VideoProvider;
