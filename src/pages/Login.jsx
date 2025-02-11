import { Input } from "@/components/ui/input";

export default function Login() {
    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
            <div className="flex flex-col justify-center items-center gap-2">
                <Input
                    type="email"
                    placeholder="Email"
                />
                <Input
                    type="password"
                    placeholder="Password"
                />
            </div>
        </div>
    );
}