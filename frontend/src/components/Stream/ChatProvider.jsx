import React, { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import streamService from "../../services/stream.service";
import { STREAM_API_KEY } from "../../config/stream";

import { useAuth } from "../../context/AuthContext";

const ChatContext = React.createContext();

const ChatProvider = ({
  children,
  userId,
  roomId,
  isGuest = false,
  guestInfo,
}) => {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const chatClientRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log("Initializing chat with:", {
          userId,
          roomId,
          isGuest,
          guestInfo,
        });

        // Validate guestInfo when in guest mode
        if (isGuest && (!guestInfo?.firstName || !guestInfo?.lastName)) {
          console.error("Missing guest information:", guestInfo);
          setError("Invalid guest information");
          return;
        }

        const cleanUserId = userId.replace("@", "_").replace(".", "_");
        const { token } = await streamService.generateToken(
          cleanUserId,
          roomId,
          isGuest ? guestInfo : null
        );

        if (!chatClientRef.current) {
          chatClientRef.current = StreamChat.getInstance(STREAM_API_KEY);
        }

        const isConnected = chatClientRef.current.user?.id === cleanUserId;

        if (!isConnected) {
          const displayName = isGuest
            ? `${guestInfo.firstName} ${guestInfo.lastName}`.trim()
            : `${user?.first_name} ${user?.last_name}`.trim();

          console.log("Connecting user with:", {
            id: cleanUserId,
            name: displayName,
            role: isGuest ? "guest" : "admin",
          });

          // First connect with minimal info
          await chatClientRef.current.connectUser(
            {
              id: cleanUserId,
              name: displayName,
            },
            token
          );

          // Then update with full user data
          await chatClientRef.current.updateUser({
            id: cleanUserId,
            name: displayName,
            role: isGuest ? "guest" : "admin",
            firstName: isGuest ? guestInfo.firstName : user?.first_name,
            lastName: isGuest ? guestInfo.lastName : user?.last_name,
            image: null,
          });

          console.log("Connected user:", chatClientRef.current.user);
        }

        const channelInstance = chatClientRef.current.channel(
          "messaging",
          roomId,
          {
            members: [cleanUserId],
            presence: true,
          }
        );

        await channelInstance.watch({ presence: true });

        // Debug channel members
        const members = await channelInstance.queryMembers({});
        console.log("Channel members:", members);

        setClient(chatClientRef.current);
        setChannel(channelInstance);
      } catch (err) {
        console.error("Chat initialization error:", err);
        setError(err.message);
      }
    };

    if (userId && roomId) {
      initChat();
    }

    return () => {
      const cleanup = async () => {
        try {
          if (channel) {
            await channel.stopWatching();
          }
          if (chatClientRef.current) {
            await chatClientRef.current.disconnectUser();
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [userId, roomId, isGuest, guestInfo, user]);

  if (error) return <div className="error">Error: {error}</div>;
  if (!client || !channel) return <div className="loading">Loading...</div>;

  return (
    <ChatContext.Provider value={{ client, channel }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatProvider;
