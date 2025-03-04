import React, { useState, useEffect } from "react";
import {
  StreamVideoClient,
  CallingState,
  StreamCall,
} from "@stream-io/video-react-sdk";
import streamService from "../../services/stream.service";
import { STREAM_API_KEY } from "../../config/stream";
import { useAuth } from "../../context/AuthContext";
import hrService from "../../services/hr.service";

const VideoProvider = ({
  children,
  userId,
  roomId,
  isGuest = false,
  guestInfo,
  onLeave,
}) => {
  const [token, setToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isSubscribed = true;
    let tokenRefreshInterval;

    const handleCallEnd = async () => {
      if (!isSubscribed) return;

      try {
        // Set ended flag first
        localStorage.setItem(`interview-${roomId}-ended`, "true");

        if (!isGuest && call) {
          // Handle recording for HR
          try {
            console.log("Stopping recording...");
            await call.stopRecording();
            console.log("Recording stopped successfully");

            await new Promise((resolve, reject) => {
              const recordingReadyHandler = async () => {
                try {
                  console.log("Recording is ready, querying...");
                  const recordings = await call.queryRecordings();

                  if (recordings?.recordings?.length > 0) {
                    console.log(
                      "Found recording, saving...",
                      recordings.recordings[0]
                    );
                    await hrService.saveRecording({
                      interview_id: roomId,
                      recording_url: recordings.recordings[0].url,
                      chat_log: JSON.stringify(call.state?.chatMessages || []),
                    });
                    console.log("Recording saved successfully");
                    resolve();
                  } else {
                    reject(new Error("No recordings found"));
                  }
                } catch (error) {
                  console.error("Failed to fetch/save recording:", error);
                  reject(error);
                } finally {
                  // Cleanup listener
                  call.off("call.recording_ready", recordingReadyHandler);
                }
              };

              // Add recording ready listener
              call.on("call.recording_ready", recordingReadyHandler);

              // Set timeout for recording save
              setTimeout(() => {
                call.off("call.recording_ready", recordingReadyHandler);
                reject(new Error("Recording save timeout"));
              }, 45000);
            });
          } catch (error) {
            console.error("Error handling recording:", error);
          }
        }

        // Common cleanup for both roles
        if (onLeave) await onLeave();

        // Leave call before navigation
        try {
          if (!isGuest) {
            await call.endCall();
          } else {
            await call.leave();
          }
        } catch (error) {
          console.error("Error leaving call:", error);
        }

        // Force navigation based on role
        if (isGuest) {
          window.location.replace("/interview-ended?guest=true");
        } else {
          window.location.replace("/admin/hr/dashboard/interviews");
        }
      } catch (error) {
        console.error("Error in handleCallEnd:", error);
        // Fallback navigation
        window.location.replace(
          isGuest
            ? "/interview-ended?guest=true"
            : "/admin/hr/dashboard/interviews"
        );
      }
    };

    const initCall = async (videoClient) => {
      const callInstance = videoClient.call("default", roomId);

      callInstance.on("calling.state.changed", async (event) => {
        console.log("Call state changed:", event.callingState);
        if (event.callingState === CallingState.LEFT) {
          console.log("Call left, handling navigation...");
          localStorage.setItem(`interview-${roomId}-ended`, "true");
          if (isGuest) {
            await handleCallEnd();
            window.location.replace("/interview-ended?guest=true");
          } else {
            await handleCallEnd();
            window.location.replace("/admin/hr/dashboard/interviews");
          }
        }
      });

      // Update member left handler
      callInstance.on("call.member.left", async (event) => {
        console.log("Member left:", event);
        if (isGuest && event.member.role === "admin") {
          console.log("Host left, ending call for guest");
          localStorage.setItem(`interview-${roomId}-ended`, "true");
          await handleCallEnd();
          window.location.replace("/interview-ended?guest=true");
        } else if (!isGuest && event.member.role === "guest") {
          console.log("Guest left, ending call for host");
          localStorage.setItem(`interview-${roomId}-ended`, "true");
          await handleCallEnd();
          window.location.replace("/admin/hr/dashboard/interviews");
        }
      });

      // Update member removed handler
      callInstance.on("call.member.removed", async (event) => {
        console.log("Member removed:", event);
        localStorage.setItem(`interview-${roomId}-ended`, "true");
        await handleCallEnd();

        // Force redirect based on role
        if (isGuest) {
          window.location.replace("/interview-ended?guest=true");
        } else {
          window.location.replace("/admin/hr/dashboard/interviews");
        }
      });

      callInstance.on("call.ended", async (event) => {
        console.log("Call ended");
        await handleCallEnd();
        if (isGuest) {
          window.location.replace("/interview-ended?guest=true");
        }
      });

      callInstance.on("call.session_ended", async (event) => {
        console.log("Call session ended");
        await handleCallEnd();
        if (isGuest) {
          window.location.replace("/interview-ended?guest=true");
        }
      });

      try {
        if (!isGuest) {
          await callInstance.create({
            members: [{ user_id: userId, role: "admin" }],
          });

          await callInstance.join({
            create: false,
            ring: false,
            data: { role: "admin" },
          });

          // Check if call is already being recorded before starting
          try {
            const callState = await callInstance.get();
            if (!callState.recording) {
              console.log("Starting recording...");
              await callInstance.startRecording();
              console.log("Recording started successfully");
            } else {
              console.log("Call is already being recorded");
            }
          } catch (recordingError) {
            console.error("Error managing recording:", recordingError);
          }

          const guestId = new URLSearchParams(window.location.search).get(
            "guest_id"
          );
          if (guestId) {
            await callInstance.updateCallMembers({
              update_members: [{ user_id: guestId, role: "guest" }],
            });
          }
        } else {
          try {
            await callInstance.get();
          } catch (err) {
            console.error("Call does not exist yet. Waiting for host...");
            setError("Please wait for the host to start the call.");
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
        return null;
      }
    };

    const initToken = async () => {
      if (!isSubscribed) return;

      try {
        if (client) {
          await client.disconnectUser();
        }

        const cleanUserId = userId.replace("@", "_").replace(".", "_");
        const displayName = isGuest
          ? `${guestInfo?.firstName} ${guestInfo?.lastName}`.trim()
          : `${user?.first_name} ${user?.last_name}`.trim();

        const { token: streamToken } = await streamService.generateToken(
          cleanUserId,
          roomId,
          isGuest ? guestInfo?.firstName : user?.first_name,
          isGuest ? guestInfo?.lastName : user?.last_name
        );

        if (!isSubscribed) return;

        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: cleanUserId,
            name: displayName || "Guest",
            role: isGuest ? "guest" : "admin",
          },
          token: streamToken,
        });

        if (!isSubscribed) return;

        setClient(videoClient);
        const callInstance = await initCall(videoClient);
        if (!isSubscribed) return;

        setCall(callInstance);
        setToken(streamToken);

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
          }, 23 * 60 * 60 * 1000);
        }
      } catch (err) {
        if (!isSubscribed) return;
        setError(err.message);
        console.error("Token generation error:", err);
      }
    };

    const isInterviewEnded = localStorage.getItem(`interview-${roomId}-ended`);
    if (isInterviewEnded === "true" && isGuest) {
      if (onLeave) onLeave();
      return;
    }

    initToken();

    return () => {
      isSubscribed = false;
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);

      if (call) {
        call.off("calling.state.changed");
        call.off("call.recording_ready");
        call.off("call.member.left");
        call.off("call.member.removed");
        call.off("call.ended");
        call.off("call.session_ended");

        const cleanup = async () => {
          try {
            localStorage.setItem(`interview-${roomId}-ended`, "true");
            if (isGuest) {
              if (onLeave) await onLeave();
              await call.leave();
              window.location.replace("/interview-ended?guest=true");
            }
          } catch (err) {
            console.error("Failed during cleanup:", err);
            window.location.replace("/interview-ended?guest=true");
          }
        };

        cleanup();
      }

      //   if (isGuest) {
      //     localStorage.setItem(`interview-${roomId}-ended`, "true");
      //     window.location.replace("/interview-ended?guest=true");
      //   }

      //   call
      //     .leave()
      //     .catch((err) => console.error("Failed to leave call:", err));

      //   cleanup().catch((err) => console.error("Error during cleanup:", err));
      // }

      if (client) {
        client
          .disconnectUser()
          .catch((err) => console.error("Failed to disconnect:", err));
      }
    };
  }, [userId, roomId, isGuest, guestInfo, user, onLeave]);

  if (error) return <div>Error: {error}</div>;
  if (!token || !client || !call) return <div>Loading...</div>;

  return <StreamCall call={call}>{children({ client, call })}</StreamCall>;
};

export default VideoProvider;
