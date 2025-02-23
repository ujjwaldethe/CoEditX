import { useState } from "react";
import { Send } from "lucide-react";

export default function Chat({ theme }) {
  const isDark = theme === "vs-dark" || theme === "hc-black";

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

  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Alice",
      text: "Hey everyone! How's it going?",
      type: "received",
    },
    { id: 2, sender: "You", text: "Hey Alice! I'm doing well", type: "sent" },
    {
      id: 3,
      sender: "Bob",
      text: "I'm great too! Excited for the weekend!",
      type: "received",
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), sender: "You", text: userMessage, type: "sent" },
      ]);
      setUserMessage("");
    }
  };

  return (
    <div className={`w-full h-full ${colors.background} flex flex-col`}>
      <div
        className={`${colors.headerBg} h-9 p-2 border-b ${colors.border} flex items-center justify-between`}
      >
        <h3 className={`${colors.headerText} text-md font-semibold`}>
          Messages
        </h3>
        <div className={`${colors.mutedText} text-sm`}>3 participants</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
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
              {msg.type === "received" && (
                <div className={`text-sm ${colors.senderNameText} mb-1`}>
                  {msg.sender}
                </div>
              )}
              <div className="text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
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
          />
          <button
            type="submit"
            className={`${colors.buttonBg} ${colors.sentMessageText} p-2 rounded-lg 
              ${colors.buttonHover} transition-colors`}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
