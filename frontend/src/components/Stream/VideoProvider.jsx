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
    let isSubscribed = true; // Track subscription state to prevent race conditions

    const initToken = async () => {
      if (!isSubscribed) return;

      try {
        // Clean up any existing client connection before initializing a new one
        if (client) {
          await client.disconnectUser();
        }

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

        // Generate the token
        const { token: streamToken } = await streamService.generateToken(
          cleanUserId,
          roomId,
          firstName,
          lastName
        );

        if (!isSubscribed) return;

        // Initialize the video client
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: cleanUserId,
            name: `${firstName} ${lastName}` || cleanUserId,
          },
          token: streamToken,
        });

        if (!isSubscribed) return;

        setClient(videoClient);

        // Initialize the call
        const callInstance = await initCall(videoClient);
        if (!isSubscribed) return;

        setCall(callInstance);
        setToken(streamToken);

        // Set up token refresh for guests
        if (isGuest) {
          tokenRefreshInterval = setInterval(async () => {
            try {
              const { token: refreshedToken } =
                await streamService.generateToken(cleanUserId, roomId);
              if (!isSubscribed) return;

              setToken(refreshedToken);
              videoClient.setToken(refreshedToken);
            } catch (err) {
              console.error("Token refresh failed:", err);
            }
          }, 23 * 60 * 60 * 1000); // Refresh every 23 hours
        }
      } catch (err) {
        if (!isSubscribed) return;
        setError(err.message);
        console.error("Token generation error:", err);
      }
    };

    const initCall = async (videoClient) => {
      const callInstance = videoClient.call("default", roomId);

      try {
        if (!isGuest) {
          // Host creates the call and joins as an admin
          await callInstance.create({
            members: [{ user_id: userId, role: "admin" }],
          });

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
          try {
            await callInstance.get(); // Check if the call exists
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
            ring: true, // Ringing for guests
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
      isSubscribed = false; // Mark as unsubscribed to prevent further updates

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
