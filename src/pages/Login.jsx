import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GenerateIdModal from "@/components/GenerateIdModal";

export default function Login() {
  const [roomId, setRoomId] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center relative">
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-900/20"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-pink-900/20"></div>

      <div className="w-96 bg-gray-900/50 p-6 rounded-3xl border-0 relative">
        <div className="absolute -top-6 -right-6 w-16 h-16 border-t-2 border-r-2 rounded-tr-xl border-pink-500"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 border-b-2 border-l-2 rounded-bl-xl border-pink-500"></div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-pink-500 text-sm">Room ID</label>
            <Input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-gray-800/50 border-0 text-white placeholder-gray-400 focus:ring-pink-500"
              placeholder="Enter room ID"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-pink-500 text-sm">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 border-0 text-white placeholder-gray-400 focus:ring-pink-500"
              placeholder="Enter your email"
            />
          </div>

          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md transition-colors">
            Join
          </Button>

          <GenerateIdModal
            email={email}
            setEmail={setEmail}
            setRoomId={setRoomId}
          />
        </div>
      </div>
    </div>
  );
}
