import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import axios from "axios";

export default function GenerateIdModal({ email, setEmail, setRoomId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  async function generateUniqueId() {
    try {
      if (!email) {
        setEmailError("Email is required");
        return null;
      }
      
      if (!isValidEmail(email)) {
        setEmailError("Please enter a valid email address");
        return null;
      }
      
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/generate-room-id`,
        {
          email: email,
        }
      );
      return response.data.room_id;
    } catch (error) {
      console.error("Error generating unique ID:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-center text-pink-500 text-sm hover:text-pink-400 underline transition-colors">
          Generate Unique Room ID
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-pink-500">Generate Room ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-200">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={`w-full bg-gray-800/50 border-0 text-white placeholder-gray-400 focus:ring-pink-500 ${
                emailError ? "border border-red-500" : ""
              }`}
              placeholder="Enter your email"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <Button
            type="button"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            onClick={async () => {
              const id = await generateUniqueId();
              if (id) {
                setRoomId(id);
                setIsDialogOpen(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate ID"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}