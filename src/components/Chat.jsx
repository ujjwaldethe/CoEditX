import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import axios from "axios";
import VoiceCall from "../components/VoiceCall";

export default function Chat({ theme, roomId }) {
  const userEmail = localStorage.getItem("code-editor-user-email");
  const isDark = theme === "vs-dark" || theme === "hc-black";
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const processedMessageIds = useRef(new Set());

  const colors = {
    // Main backgrounds
    background: isDark ? "bg-[#1e1e1e]" : "bg-white",
    headerBg: isDark ? "bg-[#252526]" : "bg-gray-100",
    inputBg: isDark ? "bg-[#3c3c3c]" : "bg-gray-100",

    // Message colors
    sentMessageBg: isDark ? "bg-pink-600" : "bg-pink-500",
    receivedMessageBg: isDark ? "bg-[#2D2D2D]" : "bg-gray-200",

    // Text colors
    headerText: isDark ? "text-gray-200" : "text-gray-800",
    mutedText: isDark ? "text-gray-400" : "text-gray-500",
    messageText: isDark ? "text-gray-100" : "text-gray-800",
    sentMessageText: "text-white",
    senderNameText: isDark ? "text-pink-400" : "text-pink-600",

    // Borders
    border: isDark ? "border-gray-800" : "border-gray-200",

    // Button colors
    buttonBg: isDark ? "bg-pink-600" : "bg-pink-500",
    buttonHover: isDark ? "hover:bg-pink-700" : "hover:bg-pink-600",

    // Focus states
    focusRing: isDark ? "focus:ring-pink-600" : "focus:ring-pink-500",
  };

  async function getParticipants() {
    const response = await axios.get(
      `http://localhost:8000/get-room-members/${roomId}`
    );
    const participants = response.data.data;
    setParticipants(participants);
  }

  // Load existing messages from API
  useEffect(() => {
    const loadExistingMessages = async () => {
      try {
        setIsLoading(true);
        // Make sure to use the full URL including base URL
        const response = await fetch(
          `http://localhost:8000/chat/${roomId}/recent`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Loaded messages:", data);

          const formattedMessages = data.map((msg) => ({
            id: msg.id,
            sender: msg.sender_email,
            text: msg.message,
            type: msg.sender_email === userEmail ? "sent" : "received",
          }));

          // Track processed message IDs
          formattedMessages.forEach((msg) => {
            processedMessageIds.current.add(msg.id);
          });
          setMessages(formattedMessages);
        } else {
          console.error("Failed to load messages:", await response.text());
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId && userEmail) {
      loadExistingMessages();
    }
  }, [roomId, userEmail]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

      socket.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "chat_message") {
          const msgContent = data.content;
          const senderEmail = msgContent.sender_email;
          const messageId = msgContent.id || Date.now().toString();

          // Check if we've already processed this message
          if (processedMessageIds.current.has(messageId)) {
            console.log("Skipping duplicate message:", messageId);
            return;
          }

          // Add message ID to processed set
          processedMessageIds.current.add(messageId);
          const newMessage = {
            id: messageId,
            sender: senderEmail,
            text: msgContent.message,
            type: senderEmail === userEmail ? "sent" : "received",
          };

          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else if (data.type === "user_disconnected") {
          // Handle user disconnection if needed
          console.log("User disconnected");
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socket.close();
      };

      socketRef.current = socket;
    };

    if (roomId) {
      connectWebSocket();
    }

    // Clean up WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomId, userEmail]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userMessage.trim() && isConnected) {
      // Send message via WebSocket
      const messageData = {
        type: "chat_message",
        content: {
          message: userMessage,
          sender_email: userEmail,
        },
      };

      socketRef.current.send(JSON.stringify(messageData));
      setUserMessage("");
    }
  };

  // Get user's display name from email
  const getDisplayName = (email) => {
    // Extract name from email (before the @ symbol)
    const name = email.split("@")[0];
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className={`w-full h-full ${colors.background} flex flex-col`}>
      <div
        className={`${colors.headerBg} h-9 p-2 border-b ${colors.border} flex items-center justify-between`}
      >
        <h3 className={`${colors.headerText} text-md font-semibold`}>
          Messages {isLoading && "(Loading...)"}
        </h3>
        <VoiceCall  theme={theme} roomId={roomId} />
      </div>
    
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className={`text-center ${colors.mutedText}`}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className={`text-center ${colors.mutedText}`}>
            No messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "sent" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-2 ${
                  msg.type === "sent"
                    ? `${colors.sentMessageBg} ${colors.sentMessageText} rounded-br-none`
                    : `${colors.receivedMessageBg} ${colors.messageText} rounded-bl-none`
                }`}
              >
                <div
                  className={`text-xs mb-1 flex items-center ${
                    msg.type === "sent" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.type === "received" && (
                    <span className={`${colors.senderNameText} font-medium`}>
                      {getDisplayName(msg.sender)}
                    </span>
                  )}
                  {msg.type === "sent" && (
                    <span className="font-medium text-white opacity-80">
                      You
                    </span>
                  )}
                </div>
                <div className="text-sm">{msg.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.type === "sent"
                      ? "text-right text-white opacity-60"
                      : "text-left opacity-60"
                  }`}
                >
                  {msg.sender}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className={`px-2 pt-1 ${colors.mutedText} text-xs border-t ${colors.border}`}
      >
        <div className="flex items-center">
          <User size={12} className="mr-1" />
          <span>
            Sending as: <strong>{userEmail}</strong>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Enter a message..."
            className={`flex-1 ${colors.inputBg} ${colors.messageText} text-sm rounded-lg px-2 py-2 
              focus:outline-none focus:ring-2 ${colors.focusRing}`}
            disabled={!isConnected || isLoading}
          />
          <button
            type="submit"
            className={`${colors.buttonBg} ${
              colors.sentMessageText
            } p-2 rounded-lg 
              ${colors.buttonHover} transition-colors ${
              !isConnected || isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isConnected || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
