import { useState } from "react";
import { Send } from "lucide-react";

export default function Chat() {
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
        { id: 4, sender: "You", text: userMessage, type: "sent" },
      ]);
      setUserMessage("");
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      <div className="bg-gray-800 h-9 p-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-pink-500 text-md font-semibold">Messages</h3>
        <div className="text-gray-400 text-sm">3 participants</div>
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
                  ? "bg-pink-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.type === "received" && (
                <div className="text-sm text-pink-400 mb-1">{msg.sender}</div>
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
            className="flex-1 bg-gray-700 text-gray-100 text-sm rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
