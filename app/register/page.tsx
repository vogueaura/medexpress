"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // Move to OTP
    } else {
      setIsLoading(true);
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* Left Form Area */}
      <div className="flex flex-col justify-center px-4 sm:px-12 py-12 lg:px-24 xl:px-32 relative z-10">
        
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 lg:hidden w-fit">
          <div className="w-8 h-8 rounded-xl gradient-medical flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            MedExpress
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <AnimatePresence mode="wait">
            
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground mb-8">
                  Join MedExpress to get fast delivery and expert advice.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Ahmed Hassan" 
                        required
                        className="pl-10 h-12 rounded-xl bg-muted/50 focus:bg-background transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        required
                        className="pl-10 h-12 rounded-xl bg-muted/50 focus:bg-background transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+20 100 123 4567" 
                        required
                        className="pl-10 h-12 rounded-xl bg-muted/50 focus:bg-background transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        required
                        className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 focus:bg-background transition-colors" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 pb-4">
                    <Checkbox id="terms" required className="mt-1" />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed font-normal">
                      I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 text-base"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Verify Phone</h1>
                <p className="text-muted-foreground mb-8">
                  We've sent a 6-digit verification code to <span className="font-medium text-foreground">+20 100 *** **67</span>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Input 
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted/50 focus:bg-background"
                        placeholder="-"
                      />
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 text-base"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button className="font-semibold text-primary hover:underline">
                    Resend Code
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Right Art Area */}
      <div className="hidden lg:flex relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-medical opacity-10" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full max-w-lg px-8 text-center">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Secure</h3>
              <p className="text-xs text-muted-foreground">Encrypted health data</p>
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Authentic</h3>
              <p className="text-xs text-muted-foreground">Licensed pharmacy</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Join MedExpress</h2>
          <p className="text-lg text-muted-foreground">
            Create an account to track your orders, save addresses, and easily reorder your medicines.
          </p>
        </div>
      </div>

    </div>
  );
}
