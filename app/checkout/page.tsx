"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, CreditCard, Banknote, Upload, CheckCircle2,
  AlertCircle, ChevronRight, FileText, ChevronLeft, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart, isLoaded } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPrescriptionItems = items.some((item) => item.medicine.prescriptionRequired);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (!isLoaded) return null;

  if (items.length === 0 && step !== 4) {
    router.push("/cart");
    return null;
  }

  const handleNext = () => {
    if (step === 2 && hasPrescriptionItems) {
      // Need prescription check
      setStep(3);
    } else if (step === 2) {
      setStep(3);
    } else {
      setStep(step + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    clearCart();
    setStep(4);
    toast.success("Order placed successfully!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Steps Progress */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative z-10">
              {["Address", "Payment", "Review"].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > i + 1 ? "bg-emerald-500 text-white" :
                    step === i + 1 ? "bg-primary text-white ring-4 ring-primary/20" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${step >= i + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-muted absolute top-12 left-8 right-8 -z-10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Address */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Delivery Address</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Ahmed" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Hassan" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+20 100 123 4567" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="15 Tahrir Street, Apt 4B" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Cairo" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" placeholder="11511" className="rounded-xl h-11" />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="e.g., Leave at the door" className="rounded-xl min-h-[100px] resize-none" />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext} className="rounded-xl gradient-medical text-white border-0 px-8 h-12 text-base">
                    Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Payment */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Option 1: COD */}
                  <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod" 
                      checked={paymentMethod === "cod"} 
                      onChange={() => setPaymentMethod("cod")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary focus:ring-primary accent-primary" 
                    />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                        <Banknote className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order arrives</p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Card */}
                  <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === "card"} 
                      onChange={() => setPaymentMethod("card")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary focus:ring-primary accent-primary" 
                    />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, AMEX</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {paymentMethod === "card" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <Label>Card Number</Label>
                            <Input placeholder="0000 0000 0000 0000" className="rounded-xl h-11 bg-background" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Date</Label>
                              <Input placeholder="MM/YY" className="rounded-xl h-11 bg-background" />
                            </div>
                            <div className="space-y-2">
                              <Label>CVV</Label>
                              <Input placeholder="123" className="rounded-xl h-11 bg-background" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </label>

                  {/* Option 3: Wallet */}
                  <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="wallet" 
                      checked={paymentMethod === "wallet"} 
                      onChange={() => setPaymentMethod("wallet")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary focus:ring-primary accent-primary" 
                    />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                        <Wallet className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold">Mobile Wallet</p>
                        <p className="text-sm text-muted-foreground">Pay with Apple Pay, Google Pay, etc.</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleNext} className="rounded-xl gradient-medical text-white border-0 px-8 h-12 text-base">
                    Review Order <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Review Your Order</h2>
                </div>

                {hasPrescriptionItems && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-6 text-blue-800 dark:text-blue-300">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="font-bold mb-1">Prescription Required</h4>
                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-3">
                          Your order contains prescription medicines. Please upload a valid prescription image. 
                          Our pharmacists will review it before processing your order.
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs px-4 border-0">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Prescription
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-2xl p-5 mb-6">
                  <h3 className="font-bold mb-4">Order Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.medicine.id} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <span className="font-medium text-muted-foreground">{item.quantity}x</span>
                          <span>{item.medicine.name}</span>
                        </div>
                        <span className="font-semibold" dir="ltr">{(item.medicine.price * item.quantity).toFixed(2)} <span className="text-xs">EGP</span></span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between" dir="ltr">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{subtotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between" dir="ltr">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>{deliveryFee.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-border" dir="ltr">
                      <span>Total to Pay</span>
                      <span className="text-primary">{total.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h4 className="font-bold mb-2">Delivery To</h4>
                    <p className="text-muted-foreground">Ahmed Hassan</p>
                    <p className="text-muted-foreground">15 Tahrir Street, Apt 4B</p>
                    <p className="text-muted-foreground">Cairo, 11511</p>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h4 className="font-bold mb-2">Payment Method</h4>
                    <p className="text-muted-foreground capitalize">{paymentMethod.replace("-", " ")}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl order-2 sm:order-1">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Payment
                  </Button>
                  <Button 
                    onClick={handleConfirmOrder} 
                    disabled={isSubmitting}
                    className="rounded-xl gradient-medical text-white border-0 px-8 h-12 text-base order-1 sm:order-2 shadow-lg shadow-teal-500/25"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Confirm Order <CheckCircle2 className="w-5 h-5 ml-2" />
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Thank you for your order. Your order ID is <span className="font-bold text-foreground">ORD-2024-889</span>. 
                  We'll send you an email confirmation with tracking details shortly.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-xl px-6">View Order</Button>
                  </Link>
                  <Link href="/">
                    <Button className="rounded-xl gradient-medical text-white border-0 px-6 shadow-lg">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
