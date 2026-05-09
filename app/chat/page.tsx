"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, MoreVertical, Search, ShieldCheck,
  Video, Phone, User, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "pharmacist";
  time: string;
  isInitial?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Dr. Sarah, a licensed pharmacist. How can I help you today?",
      sender: "pharmacist",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInitial: true,
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate response
    setTimeout(() => {
      const newPharmacistMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for sharing. I'll need a moment to check that for you. Have you taken any other medications recently?",
        sender: "pharmacist",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newPharmacistMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-140px)] bg-muted/20 py-4 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-120px)] lg:h-[calc(100vh-200px)]">
        
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-border">
                  <AvatarImage src="https://i.pravatar.cc/150?u=dr_sarah" />
                  <AvatarFallback className="bg-primary/10 text-primary">DS</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold">Dr. Sarah</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online • Licensed Pharmacist
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-xs text-amber-800 dark:text-amber-400 flex items-center justify-center gap-2 border-b border-amber-200 dark:border-amber-800 shrink-0">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-center">This chat is end-to-end encrypted. In an emergency, dial 911 immediately.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="text-center">
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">
                Today
              </span>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className={`p-4 rounded-2xl relative ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted/80 text-foreground rounded-bl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                    {msg.sender === "user" && <User className="w-3 h-3" />}
                    {msg.time}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start max-w-[75%]"
              >
                <div className="bg-muted/80 p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
              <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="relative flex-1">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full h-12 pr-12 bg-muted/50 focus:bg-background border-border/50"
                />
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-full gradient-medical text-white border-0 shrink-0 shadow-md shadow-teal-500/20"
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
