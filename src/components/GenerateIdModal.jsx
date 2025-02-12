import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"

export default function GenerateIdModal() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="w-full text-center text-pink-500 text-sm hover:text-pink-400 underline transition-colors"
              >
                Generate Unique Room ID
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-pink-500">Generate Room ID</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-200">Email</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border-0 text-white placeholder-gray-400 focus:ring-pink-500"
                    placeholder="Enter your email"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Generate ID
                </Button>
              </form>
            </DialogContent>
          </Dialog>
    )
}