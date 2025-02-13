import React, { useState, useEffect } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import streamService from "../../services/stream.service";
import { STREAM_API_KEY } from "../../config/stream";
import { useAuth } from "../../context/AuthContext";

const VideoProvider = ({ children, userId, roomId, isGuest = false }) => {
  const [token, setToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    let tokenRefreshInterval;

    const initToken = async () => {
      try {
        const cleanUserId = userId.replace("@", "_").replace(".", "_");

        let firstName, lastName;

        if (isGuest) {
          firstName = new URLSearchParams(window.location.search).get(
            "firstName"
          );
          lastName = new URLSearchParams(window.location.search).get(
            "lastName"
          );
        } else {
          firstName = user?.first_name || "";
          lastName = user?.last_name || "";
        }

        const { token: streamToken } = await streamService.generateToken(
          cleanUserId,
          roomId,
          firstName,
          lastName
        );

        // Use getOrCreateInstance to avoid creating multiple instances
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: cleanUserId,
            name: `${firstName} ${lastName}` || cleanUserId,
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

    const initCall = async (videoClient) => {
      const callInstance = videoClient.call("default", roomId);
      try {
        // Step 1: Create or join the call
        if (!isGuest) {
          // Host creates the call and adds themselves as a member
          await callInstance.create({
            members: [{ user_id: userId, role: "admin" }],
          });

          // Host explicitly joins the call
          await callInstance.join({
            create: false,
            ring: false, // No ringing for the host
            data: { role: "admin" },
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
        } else {
          // Guest joins the call
          // Check if the call exists before joining
          try {
            await callInstance.get();
          } catch (err) {
            console.error(
              "Call does not exist yet. Waiting for host to create the call..."
            );
            setError(
              "Call does not exist yet. Please wait for the host to start the call."
            );
            return null;
          }

          await callInstance.join({
            create: false,
            ring: true,
            data: { role: "guest" },
          });
        }

        return callInstance;
      } catch (err) {
        console.error("Error during call initialization:", err);
        setError("Failed to initialize call");
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
      if (client) {
        client
          .disconnectUser()
          .catch((err) => console.error("Failed to disconnect user:", err));
      }
    };
  }, [userId, roomId, isGuest, user]);

  if (error) return <div>Error: {error}</div>;
  if (!token || !client || !call) return <div>Loading...</div>;
  return children({ client, call });
};

export default VideoProvider;
