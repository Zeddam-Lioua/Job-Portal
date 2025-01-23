import React, { useState, useRef, useEffect } from "react";
import * as AgoraRTM from "agora-rtm-sdk";
import agoraService from "../../services/agora.service";
import "./ChatRoom.css";

const ChatRoom = ({ appId, channel, onStartVideoCall, onStartAudioCall }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const rtmClient = useRef(null);
  const channelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        if (!appId) {
          throw new Error("App ID is required");
        }

        rtmClient.current = AgoraRTM.createInstance(appId);
        const rtmUid = String(Math.floor(Math.random() * 10000));

        const { token } = await agoraService.generateRtmToken(rtmUid);
        if (!token) {
          throw new Error("Failed to get RTM token");
        }

        await rtmClient.current.login({ token, uid: rtmUid });
        channelRef.current = rtmClient.current.createChannel(channel);
        await channelRef.current.join();

        channelRef.current.on("ChannelMessage", ({ text }, senderId) => {
          if (isMounted) {
            setMessages((prev) => [...prev, { user: senderId, text }]);
          }
        });
      } catch (error) {
        console.error("Chat initialization error:", error);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      const cleanup = async () => {
        try {
          if (channelRef.current) {
            await channelRef.current.leave();
          }
          if (rtmClient.current?.connectionState === "CONNECTED") {
            await rtmClient.current.logout();
          }
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      };
      cleanup();
    };
  }, [appId, channel]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channelRef.current) return;

    try {
      await channelRef.current.sendMessage({ text: newMessage });
      setMessages((prev) => [...prev, { user: "me", text: newMessage }]);
      setNewMessage("");
    } catch (error) {
      console.error("Message send error:", error);
      alert("Failed to send message");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-room-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user === "me" ? "sent" : "received"}`}
          >
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div className="call-controls">
        <button onClick={onStartVideoCall}>Start Video Call</button>
        <button onClick={onStartAudioCall}>Start Audio Call</button>
      </div>
    </div>
  );
};

export default ChatRoom;
