import React, { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import streamService from "../../services/stream.service";
import { STREAM_API_KEY } from "../../config/stream";

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

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log("Initializing chat with:", {
          userId,
          roomId,
          isGuest,
          guestInfo,
        });
        const cleanUserId = userId.replace("@", "_").replace(".", "_");
        const { token } = await streamService.generateToken(
          cleanUserId,
          roomId
        );

        // Use getOrCreateInstance to avoid creating multiple instances
        if (!chatClientRef.current) {
          chatClientRef.current = StreamChat.getInstance(STREAM_API_KEY);
        }

        const isConnected = chatClientRef.current.user?.id === cleanUserId;
        if (!isConnected) {
          await chatClientRef.current.connectUser(
            {
              id: cleanUserId,
              name:
                isGuest && guestInfo
                  ? `${guestInfo.firstName} ${guestInfo.lastName}`.trim()
                  : cleanUserId,
              role: isGuest ? "guest" : "admin",
            },
            token
          );
        }

        const channelInstance = chatClientRef.current.channel(
          "messaging",
          roomId,
          {
            members: [cleanUserId],
          }
        );

        await channelInstance.watch();
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
  }, [userId, roomId, isGuest, guestInfo]);

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
