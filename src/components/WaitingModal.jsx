import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function WaitingModal({
  roomId,
  email,
  isDialogOpen,
  setIsDialogOpen,
}) {
  const [waitTime, setWaitTime] = useState(0);
  const [isHost, setIsHost] = useState(false);

  const navigate = useNavigate();

  async function validateUser() {
    const response = await axios.post(
      `${import.meta.env.VITE_API_ENDPOINT}/validate-user`,
      {
        room_id: roomId,
        email: email,
      }
    );
    if (response.status === 200) {
      const message = response.data?.message || "";
      if (message === "User is approved") {
        return true;
      }
    }
    return false;
  }

  // Simulate increasing wait time
  useEffect(() => {
    let interval;

    if (isDialogOpen) {
      interval = setInterval(async () => {
        setWaitTime((prev) => prev + 1);
        const isValidated = await validateUser();
        if (isValidated) {
          navigate(`/editor/${roomId}`);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      setWaitTime(0);
    }

    return () => clearInterval(interval);
  }, [isDialogOpen]);

  // Format wait time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="bg-gray-900 text-white border border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-pink-500 text-2xl font-bold text-center">
            Waiting in Lobby
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated spinner */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-16 w-16 text-pink-500 animate-spin" />
            </div>
            <div className="h-16 w-16 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <span className="text-pink-300 font-mono">
                {formatTime(waitTime)}
              </span>
            </div>
          </div>

          {/* Status message */}
          <div className="text-center space-y-2">
            <p className="text-gray-300">
              Waiting for the host to admit you...
            </p>
            <p className="text-sm text-gray-400">
              Please wait while you are admitted to the room.
            </p>
          </div>

          {/* Queue position indicator */}
          <div className="w-full max-w-xs bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-pink-500 h-2.5 rounded-full animate-pulse"
              style={{ width: `${Math.min(waitTime * 2, 100)}%` }}
            ></div>
          </div>

          {/* Cancel button */}
          <button
            onClick={() => setIsDialogOpen(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
