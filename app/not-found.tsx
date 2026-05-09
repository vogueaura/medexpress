"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pill, Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-card border border-border shadow-xl rounded-3xl flex items-center justify-center transform rotate-12">
            <Pill className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          Oops! It seems the page you are looking for has been misplaced or doesn't exist. 
          Let's get you back on track to your health journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto rounded-xl gradient-medical text-white border-0 h-12 px-8 shadow-lg shadow-teal-500/25">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl h-12 px-8">
              <Search className="w-4 h-4 mr-2" />
              Search Medicines
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
