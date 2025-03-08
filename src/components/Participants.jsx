import { useState, useEffect } from "react";
import {
  User,
  ClipboardCopy,
  Check,
  LogOut,
  UserMinus,
  Users,
  UserPlus,
  X,
  Clock,
} from "lucide-react";

export default function Participants({ theme, isHost = true }) {
  const isDark = theme === "vs-dark" || theme === "hc-black";
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const colors = {
    background: isDark ? "bg-[#1e1e1e]" : "bg-white",
    panelBg: isDark ? "bg-[#252526]" : "bg-gray-50",
    activeBg: isDark ? "bg-[#37373d]" : "bg-white",
    headerText: isDark ? "text-gray-200" : "text-gray-800",
    mutedText: isDark ? "text-gray-400" : "text-gray-500",
    nameText: isDark ? "text-gray-100" : "text-gray-800",
    border: isDark ? "border-gray-700" : "border-gray-200",
    activeBorder: isDark ? "border-pink-600" : "border-pink-300",
    iconBg: isDark ? "bg-[#3d3d3d]" : "bg-gray-200",
    roomIdBg: isDark ? "bg-[#2d2d2d]" : "bg-gray-100",
    buttonHover: isDark ? "hover:bg-[#404040]" : "hover:bg-gray-200",
    leaveButtonBg: isDark ? "bg-[#4d2020]" : "bg-red-50",
    leaveButtonHover: isDark ? "hover:bg-[#662828]" : "hover:bg-red-100",
    leaveButtonText: isDark ? "text-red-300" : "text-red-600",
    divider: isDark ? "bg-gray-700" : "bg-gray-200",
    acceptButtonBg: isDark ? "bg-[#1e4620]" : "bg-green-50",
    acceptButtonHover: isDark ? "hover:bg-[#2a5c2c]" : "hover:bg-green-100",
    acceptButtonText: isDark ? "text-green-300" : "text-green-600",
    rejectButtonBg: isDark ? "bg-[#461e1e]" : "bg-red-50",
    rejectButtonHover: isDark ? "hover:bg-[#5c2a2a]" : "hover:bg-red-100",
    rejectButtonText: isDark ? "text-red-300" : "text-red-600",
    waitingBadgeBg: isDark ? "bg-amber-900" : "bg-amber-100",
    waitingBadgeText: isDark ? "text-amber-200" : "text-amber-700",
    sectionBg: isDark ? "bg-[#2a2a2a]" : "bg-gray-100",
  };

  // Mock participants data
  const [participants, setParticipants] = useState([
    { id: 1, name: "John Doe", isOnline: true, isHost: true, isYou: true },
    { id: 2, name: "Alice Smith", isOnline: true, isHost: false },
    { id: 3, name: "Bob Johnson", isOnline: false, isHost: false },
    { id: 4, name: "Sarah Wilson", isOnline: true, isHost: false },
  ]);

  // Mock waiting participants
  const [waitingParticipants, setWaitingParticipants] = useState([
    { id: 101, name: "Mike Thompson", waitingSince: "2 min ago" },
    { id: 102, name: "Emma Davis", waitingSince: "just now" },
  ]);

  useEffect(() => {
    // Extract room ID from URL
    const path = window.location.pathname;
    const pathParts = path.split("/");
    if (pathParts.length >= 3 && pathParts[1] === "editor") {
      setRoomId(pathParts[2]);
    } else {
      setRoomId("demo-room-123"); // Fallback for demo
    }
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    window.location.href = "/";
  };

  const handleKickout = (participantId) => {
    setParticipants(participants.filter((p) => p.id !== participantId));
  };

  const handleAdmit = (participantId) => {
    const admittedParticipant = waitingParticipants.find(
      (p) => p.id === participantId
    );
    if (admittedParticipant) {
      setParticipants([
        ...participants,
        {
          id: admittedParticipant.id,
          name: admittedParticipant.name,
          isOnline: true,
          isHost: false,
          isYou: false,
        },
      ]);
      setWaitingParticipants(
        waitingParticipants.filter((p) => p.id !== participantId)
      );
    }
  };

  const handleReject = (participantId) => {
    setWaitingParticipants(
      waitingParticipants.filter((p) => p.id !== participantId)
    );
  };

  return (
    <div className={`w-full h-full ${colors.background} flex flex-col`}>
      {/* Header with title */}
      <div className={`px-4 py-3 flex items-center border-b ${colors.border}`}>
        <Users size={18} className={colors.headerText} />
        <h3 className={`${colors.headerText} ml-2 font-medium`}>
          Participants
        </h3>
        <div
          className={`ml-auto ${colors.mutedText} text-xs px-2 py-0.5 rounded-full ${colors.panelBg}`}
        >
          {participants.filter((p) => p.isOnline).length} online
        </div>
      </div>

      {/* Room ID section */}
      <div className="p-4">
        <div className="mb-3">
          <div className={`text-xs font-medium ${colors.mutedText} mb-1.5`}>
            ROOM INFORMATION
          </div>
          <div
            className={`flex items-center rounded-md overflow-hidden border ${colors.border}`}
          >
            <div
              className={`${colors.roomIdBg} px-3 py-2 text-xs font-mono ${colors.nameText} flex-1 truncate`}
            >
              {roomId || "loading..."}
            </div>
            <button
              onClick={handleCopyRoomId}
              className={`p-2 ${colors.buttonHover} transition-colors ${colors.headerText}`}
              title="Copy Room ID"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <ClipboardCopy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Waiting Lobby Section (only visible to host) */}
        {isHost && waitingParticipants.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div
                className={`text-xs font-medium ${colors.mutedText} mb-1.5 flex items-center`}
              >
                <Clock size={12} className={`mr-1 ${colors.mutedText}`} />
                WAITING LOBBY
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded ${colors.waitingBadgeBg} ${colors.waitingBadgeText}`}
                >
                  {waitingParticipants.length}
                </span>
              </div>
            </div>
            <div
              className={`rounded-md overflow-hidden border ${colors.border}`}
            >
              {waitingParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center ${colors.sectionBg} p-2.5 border-b ${colors.border} last:border-b-0`}
                >
                  <div
                    className={`p-1.5 rounded-full ${colors.iconBg} mr-2 flex-shrink-0`}
                  >
                    <User size={14} className={colors.headerText} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${colors.nameText} text-sm truncate`}>
                      {participant.name}
                    </div>
                    <div className={`text-xs ${colors.mutedText}`}>
                      Waiting since {participant.waitingSince}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdmit(participant.id)}
                      className={`p-1.5 rounded ${colors.acceptButtonBg} ${colors.acceptButtonHover} ${colors.acceptButtonText} transition-colors`}
                      title="Admit"
                    >
                      <UserPlus size={14} />
                    </button>
                    <button
                      onClick={() => handleReject(participant.id)}
                      className={`p-1.5 rounded ${colors.rejectButtonBg} ${colors.rejectButtonHover} ${colors.rejectButtonText} transition-colors`}
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className={`h-px w-full ${colors.divider} my-3`}></div>

        {/* Participants list header */}
        <div className={`text-xs font-medium ${colors.mutedText} mb-1.5`}>
          PARTICIPANTS
        </div>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`flex items-center rounded-md ${
              participant.isYou ? colors.activeBg : colors.panelBg
            } 
              p-2.5 ${
                participant.isYou ? `border ${colors.activeBorder}` : ""
              }`}
          >
            <div
              className={`p-1.5 rounded-full ${colors.iconBg} mr-2 flex-shrink-0`}
            >
              <User size={14} className={colors.headerText} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`${colors.nameText} text-sm truncate flex items-center`}
              >
                {participant.name}
                {participant.isYou && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${
                      isDark
                        ? "bg-pink-900 text-pink-200"
                        : "bg-pink-100 text-pink-700"
                    }`}
                  >
                    You
                  </span>
                )}
              </div>
              {participant.isHost && (
                <div className={`text-xs ${colors.mutedText}`}>Host</div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              {isHost && !participant.isYou && (
                <button
                  onClick={() => handleKickout(participant.id)}
                  className={`p-1.5 rounded-full ${colors.buttonHover} transition-colors`}
                  title="Kick Out"
                >
                  <UserMinus
                    size={14}
                    className={isDark ? "text-red-300" : "text-red-500"}
                  />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leave Room Button */}
      <div className={`px-4 py-3 border-t ${colors.border}`}>
        <button
          onClick={handleLeaveRoom}
          className={`w-full py-2 px-3 rounded-md ${colors.leaveButtonBg} ${colors.leaveButtonHover} ${colors.leaveButtonText} text-sm font-medium flex items-center justify-center gap-2 transition-colors`}
        >
          <LogOut size={16} />
          Leave Room
        </button>
      </div>
    </div>
  );
}
