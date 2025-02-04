import React, { useEffect, useState } from "react";
import streamService from "../../services/stream.service";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { STREAM_API_KEY } from "../../config/stream";
const VideoProvider = ({ children, userId, roomId }) => {
  const [token, setToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null); // Store the call instance in state
  const [error, setError] = useState(null);
  const isGuest = userId.startsWith("guest_");
  useEffect(() => {
    let tokenRefreshInterval;
    const initCall = async (videoClient) => {
      const callInstance = videoClient.call("default", roomId);
      try {
        // Add the host as a member and create the call
        await callInstance.create({
          members: [
            { user_id: userId, role: isGuest ? "call_member" : "call_host" },
          ],
        });
        // If the guest user ID is known, explicitly add the guest as a member
        const guestUserId = new URLSearchParams(window.location.search).get(
          "guest_id"
        );
        if (guestUserId && !isGuest) {
          await callInstance.updateCallMembers({
            update_members: [{ user_id: guestUserId, role: "call_member" }],
          });
        }
        // Join the call with appropriate role
        await callInstance.join({
          create: false,
          ring: true,
          data: { role: isGuest ? "call_member" : "call_host" },
        });
        setCall(callInstance); // Store the call instance in state
        return callInstance;
      } catch (err) {
        console.error("Error during call initialization:", err);
        setError("Failed to initialize the call");
      }
    };
    const initToken = async () => {
      try {
        console.log("Initializing token for user:", userId);
        const cleanUserId = userId.replace("@", "").replace(".", " ");
        const { token: streamToken } = await streamService.generateToken(
          cleanUserId,
          roomId
        );
        console.log("Token received:", streamToken);
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
      // Ensure the call exists before attempting to leave
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
