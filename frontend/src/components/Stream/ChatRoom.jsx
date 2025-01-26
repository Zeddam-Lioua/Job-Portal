import React, { useState, useEffect } from "react";
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
  const [isConnected, setIsConnected] = useState(false);

  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let chatClient;

    const initChat = async () => {
      try {
        chatClient = StreamChat.getInstance(STREAM_API_KEY);

        // Prevent multiple connections
        if (chatClient.user?.id === userId || isConnected) return;

        const { token } = await streamService.generateChatToken(userId);
        await chatClient.connectUser({ id: userId }, token);
        setIsConnected(true);

        const channel = chatClient.channel("messaging", channelId);
        await channel.watch();

        setClient(chatClient);
        setChannel(channel);
      } catch (error) {
        console.error("Chat initialization error:", error);
        setError(error.message);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
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
