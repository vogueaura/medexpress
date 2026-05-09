"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight,
  ShieldCheck, AlertCircle, Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/ui/EmptyState";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const {
    items,
    isLoaded,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    discount,
    total,
  } = useCart();

  if (!isLoaded) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any medicines to your cart yet."
          actionLabel="Start Shopping"
          actionHref="/search"
        />
      </div>
    );
  }

  const hasPrescriptionItems = items.some((item) => item.medicine.prescriptionRequired);

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cart Items List */}
          <div className="w-full lg:flex-1 space-y-4">
            {hasPrescriptionItems && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3 text-blue-700 dark:text-blue-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Prescription Required</h4>
                  <p className="text-xs">
                    Your cart contains prescription medicines. You will need to upload a valid prescription during checkout.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 space-y-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.medicine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image */}
                      <Link href={`/medicine/${item.medicine.id}`} className="shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted/50 rounded-2xl flex items-center justify-center p-2">
                          <Pill className="w-10 h-10 text-primary/40" />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <Link href={`/medicine/${item.medicine.id}`}>
                            <h3 className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate">
                              {item.medicine.name}
                            </h3>
                          </Link>
                          <span className="font-bold whitespace-nowrap ml-4" dir="ltr">
                            {(item.medicine.price * item.quantity).toFixed(2)} <span className="text-xs">EGP</span>
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 truncate">
                          {item.medicine.genericName} • {item.medicine.dosage}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border rounded-xl h-9">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-full w-9 rounded-l-xl rounded-r-none"
                              onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-full w-9 rounded-r-xl rounded-l-none"
                              onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-2 h-9"
                            onClick={() => removeItem(item.medicine.id)}
                          >
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-6" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between" dir="ltr">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between" dir="ltr">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-500 font-semibold">Free</span>
                    ) : (
                      `${deliveryFee.toFixed(2)} EGP`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500" dir="ltr">
                    <span>Discount</span>
                    <span className="font-medium">-{discount.toFixed(2)} EGP</span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between items-end" dir="ltr">
                  <span className="font-semibold text-base">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {total.toFixed(2)} EGP
                  </span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="flex gap-2 mb-6">
                <Input placeholder="Promo code" className="rounded-xl bg-muted/50" />
                <Button variant="outline" className="rounded-xl">Apply</Button>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full h-12 rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 text-base">
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Checkout guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
