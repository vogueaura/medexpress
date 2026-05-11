"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Package, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

type TrackedOrder = {
  ID: number;
  Status: string;
  CustomerName: string;
  Address: string;
  City?: string;
  TotalAmount: number;
  PaymentMethod: string;
  CreatedAt: string;
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("id") || "";
  });
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasAutoTracked = useRef(false);

  const fetchOrder = async (idToTrack: string) => {
    if (!idToTrack) return;

    setIsLoading(true);
    try {
      const id = idToTrack.replace("ORD-", "").replace(/^0+/, "");
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        toast.error("Order not found. Please check the ID.");
        setOrder(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch order status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && !hasAutoTracked.current) {
      hasAutoTracked.current = true;
      const timeoutId = window.setTimeout(() => {
        fetchOrder(orderId);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [orderId]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const statusSteps = ["pending", "preparing", "shipped", "delivered"];
  const currentStepIndex = statusSteps.indexOf(order?.Status || "pending");

  return (
    <div className="min-h-screen bg-muted/20 py-12 lg:py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground text-lg">Enter your order ID to check the real-time status of your delivery.</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-3 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="e.g., ORD-00001" 
              className="pl-12 h-14 rounded-2xl bg-card border-border/50 text-lg shadow-sm"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-14 px-8 rounded-2xl gradient-medical text-white border-0 text-base font-bold shadow-lg shadow-teal-500/20"
          >
            {isLoading ? "Checking..." : "Track Now"}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/10 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                  <h2 className="text-2xl font-bold">ORD-{order.ID.toString().padStart(5, '0')}</h2>
                </div>
                <Badge className={`rounded-xl px-4 py-1.5 text-xs capitalize ${
                  order.Status === 'delivered' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary'
                }`}>
                  {order.Status}
                </Badge>
              </div>

              <div className="p-6 sm:p-8">
                {/* Visual Progress */}
                <div className="relative flex justify-between items-center mb-12">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-muted -z-10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                        i <= currentStepIndex ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-card border-2 border-muted text-muted-foreground"
                      }`}>
                        {i < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Package className="w-4 h-4" /> Delivery Details
                    </h3>
                    <div className="space-y-1">
                      <p className="font-bold">{order.CustomerName}</p>
                      <p className="text-sm text-muted-foreground">{order.Address}</p>
                      <p className="text-sm text-muted-foreground">{order.City}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Order Info
                    </h3>
                    <div className="space-y-1">
                      <p className="font-bold">{order.TotalAmount.toFixed(2)} EGP</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.PaymentMethod.replace('-', ' ')}</p>
                      <p className="text-sm text-muted-foreground">Placed on {new Date(order.CreatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/20 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground mb-4">Need help with your order?</p>
                <Link href="/chat">
                  <Button variant="outline" className="rounded-xl px-8 h-11 border-primary/20 hover:bg-primary/5 text-primary">
                    Contact Pharmacist
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
