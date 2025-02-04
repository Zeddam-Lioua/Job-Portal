import React, { useState, useEffect, useRef } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { STREAM_API_KEY } from "../../config/stream";
import streamService from "../../services/stream.service";
import "./ChatRoom.css";
const ChatRoom = ({ userId, channelId }) => {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const chatClientRef = useRef(null);
  useEffect(() => {
    const initChat = async () => {
      try {
        // Only initialize if we don't have a client or if user changed
        if (!chatClientRef.current || chatClientRef.current.userID !== userId) {
          const cleanUserId = userId.replace("@", " ").replace(".", " ");
          const { token } = await streamService.generateToken(cleanUserId);
          if (!chatClientRef.current) {
            chatClientRef.current = StreamChat.getInstance(STREAM_API_KEY);
          }
          await chatClientRef.current.connectUser(
            {
              id: cleanUserId,
              name: cleanUserId,
            },
            token
          );
          const channel = chatClientRef.current.channel("messaging", channelId);
          await channel.watch();
          setClient(chatClientRef.current);
          setChannel(channel);
        }
      } catch (error) {
        console.error("Chat initialization error:", error);
        setError(error.message);
      }
    };
    initChat();
    return () => {
      const cleanup = async () => {
        if (chatClientRef.current) {
          setChannel(null);
          await chatClientRef.current.disconnectUser();
          chatClientRef.current = null;
        }
      };
      cleanup();
    };
  }, [userId, channelId]);
  if (error) return <div className="error">Error: {error}</div>;
  if (!client || !channel) return <div className="loading">Loading...</div>;
  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <Chat client={client} theme="messaging light">
          <Channel channel={channel}>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};
export default ChatRoom;
