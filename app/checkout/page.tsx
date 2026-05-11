"use client";

import { useEffect, useState } from "react";
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
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart, isLoaded } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: user ? user.name.split(" ")[0] : "",
    lastName: user && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "",
    phone: user ? user.phone : "",
    address: "",
    city: "",
    zip: "",
    notes: "",
    prescriptionPath: ""
  });

  const hasPrescriptionItems = items.some((item) => item.medicine.prescriptionRequired);
  const unavailableItems = items.filter(
    (item) =>
      item.medicine.availability === "out-of-stock" ||
      item.medicine.stock === 0 ||
      (typeof item.medicine.stock === "number" && item.quantity > item.medicine.stock)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    if (isLoaded && items.length === 0 && step !== 4) {
      router.push("/cart");
    }
  }, [isLoaded, items.length, router, step]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.phone || !formData.address) {
        toast.error("Please fill in the required fields (First Name, Phone, Address)");
        return;
      }
    }
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

  if (!isLoaded) return null;

  if (items.length === 0 && step !== 4) {
    return null;
  }

  const handleConfirmOrder = async () => {
    if (unavailableItems.length > 0) {
      toast.error("Some cart items are out of stock or exceed available stock.");
      router.push("/cart");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.id : null,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerPhone: formData.phone,
          address: formData.address,
          city: formData.city,
          totalAmount: total,
          paymentMethod: paymentMethod,
          prescriptionPath: formData.prescriptionPath,
          items: items
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to place order");
      }

      const data = await response.json();
      console.log("Order created:", data);
      setOrderId(data.orderId);
      
      setIsSubmitting(false);
      clearCart();
      setStep(4);
      toast.success("Order placed successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
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
                    <Input id="firstName" placeholder="Ahmed" className="rounded-xl h-11" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Hassan" className="rounded-xl h-11" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+20 100 123 4567" className="rounded-xl h-11" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="15 Tahrir Street, Apt 4B" className="rounded-xl h-11" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Cairo" className="rounded-xl h-11" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" placeholder="11511" className="rounded-xl h-11" value={formData.zip} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="e.g., Leave at the door" className="rounded-xl min-h-[100px] resize-none" value={formData.notes} onChange={handleInputChange} />
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

                  {/* Option 3: InstaPay / Vodafone Cash */}
                  <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "instapay-vodafone" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="instapay-vodafone" 
                      checked={paymentMethod === "instapay-vodafone"} 
                      onChange={() => setPaymentMethod("instapay-vodafone")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary focus:ring-primary accent-primary" 
                    />
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                        <Wallet className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold">InstaPay / Vodafone Cash</p>
                        <p className="text-sm text-muted-foreground">الدفع عبر تحويل بنكي أو محفظة إلكترونية</p>
                      </div>
                    </div>
                    {paymentMethod === "instapay-vodafone" && (
                      <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border/50 text-sm space-y-2" dir="rtl">
                        <p className="font-semibold text-primary">بيانات التحويل:</p>
                        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                          <span className="font-medium">InstaPay:</span>
                          <span className="font-bold tabular-nums">01505075674</span>
                        </div>
                        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                          <span className="font-medium">Vodafone Cash:</span>
                          <span className="font-bold tabular-nums">01004304541</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">يرجى إرسال لقطة شاشة لعملية التحويل عند التأكيد.</p>
                      </div>
                    )}
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
                        <div className="flex items-center gap-3">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs px-4 border-0"
                            onClick={() => document.getElementById('prescription-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {formData.prescriptionPath ? 'Change Prescription' : 'Upload Prescription'}
                          </Button>
                          <input 
                            type="file" 
                            id="prescription-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const uploadToast = toast.loading("Uploading prescription...");
                              const formDataUpload = new FormData();
                              formDataUpload.append('prescription', file);
                              
                              try {
                                const res = await fetch(`${API_URL}/api/upload-prescription`, {
                                  method: 'POST',
                                  body: formDataUpload
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  setFormData(prev => ({ ...prev, prescriptionPath: data.path }));
                                  toast.success("Prescription uploaded!", { id: uploadToast });
                                } else {
                                  throw new Error(data.message);
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error("Upload failed", { id: uploadToast });
                              }
                            }}
                          />
                          {formData.prescriptionPath && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Uploaded
                            </span>
                          )}
                        </div>
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
                    <p className="text-muted-foreground">{`${formData.firstName} ${formData.lastName}`.trim()}</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                    <p className="text-muted-foreground">{formData.address}</p>
                    <p className="text-muted-foreground">
                      {[formData.city, formData.zip].filter(Boolean).join(", ")}
                    </p>
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
                    disabled={isSubmitting || unavailableItems.length > 0}
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
                  Thank you for your order. Your order ID is <span className="font-bold text-foreground">{orderId ? `ORD-${orderId.toString().padStart(5, "0")}` : "confirmed"}</span>. 
                  We&apos;ll send you an email confirmation with tracking details shortly.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href={orderId ? `/track?id=${orderId}` : "/dashboard"}>
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
