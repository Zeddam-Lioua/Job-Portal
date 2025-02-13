import React from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChatRoom.css";
import ChatProvider from "./ChatProvider";
import { useChat } from "./ChatProvider";

const ChatRoomInner = () => {
  const { client, channel } = useChat();
  if (!client || !channel) return <div className="loading">Loading...</div>;
  return (
    <Chat client={client} theme="messaging light">
      <Channel channel={channel}>
        <div className="str-chat__container">
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </div>
      </Channel>
    </Chat>
  );
};

const ChatRoom = ({ userId, roomId, isGuest = false, guestInfo }) => {
  return (
    <ChatProvider
      userId={userId}
      roomId={roomId}
      isGuest={isGuest}
      guestInfo={guestInfo}
    >
      <ChatRoomInner />
    </ChatProvider>
  );
};

export default ChatRoom;
