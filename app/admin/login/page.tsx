"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        localStorage.setItem("isAdmin", "true");
        toast.success("Welcome back, Admin!");
        // Small delay to ensure localStorage is set before navigation
        setTimeout(() => {
          router.replace("/admin/orders");
        }, 300);
      } else {
        toast.error("Invalid username or password");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection failed. Is the server running?");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-border/50 bg-muted/10">
            <div className="w-16 h-16 rounded-2xl gradient-medical flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-teal-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">Secure access for Zayed Pharmacies</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="admin"
                  className="pl-12 h-12 rounded-xl bg-muted/30 border-border/50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-12 rounded-xl bg-muted/30 border-border/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl gradient-medical text-white border-0 font-bold shadow-lg shadow-teal-500/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign In <ChevronRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>
          </form>

          <div className="p-4 bg-muted/20 text-center border-t border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Powered by Antigravity AI
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
