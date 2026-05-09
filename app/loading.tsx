import { Pill } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Pill Container */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse" />
          <div className="relative z-10 w-12 h-12 bg-card border-2 border-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Pill className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-1 text-primary font-medium">
          <span>Loading</span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
