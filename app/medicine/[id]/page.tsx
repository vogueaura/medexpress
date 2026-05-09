"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, Minus, Plus, Heart, Share2,
  AlertCircle, Pill, ChevronRight, Shield, Truck,
  Clock, ArrowLeft, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import MedicineCard from "@/components/cards/MedicineCard";
import { getMedicineById, getMedicinesByCategory, medicines } from "@/data/medicines";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function MedicineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const medicine = getMedicineById(id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Medicine Not Found</h1>
        <p className="text-muted-foreground mb-6">The medicine you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/search">
          <Button className="rounded-xl gradient-medical text-white border-0">
            Browse Medicines
          </Button>
        </Link>
      </div>
    );
  }

  const relatedMedicines = getMedicinesByCategory(medicine.category)
    .filter((m) => m.id !== medicine.id)
    .slice(0, 4);

  const alternatives = medicines
    .filter((m) => m.id !== medicine.id && m.category === medicine.category && m.availability === "in-stock")
    .slice(0, 3);

  const availabilityConfig = {
    "in-stock": { label: "In Stock", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
    "low-stock": { label: "Low Stock", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-500" },
    "out-of-stock": { label: "Out of Stock", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" },
  };

  const avail = availabilityConfig[medicine.availability];

  const handleAddToCart = () => {
    addItem(medicine, quantity);
    toast.success(`${medicine.name} added to cart`, {
      description: `Quantity: ${quantity}`,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/search" className="hover:text-foreground transition-colors">Medicines</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{medicine.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Left - Image Gallery */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center overflow-hidden">
              <div className="w-48 h-48 rounded-3xl gradient-medical opacity-10 absolute" />
              <Pill className="w-32 h-32 text-primary/30" />

              {medicine.originalPrice && (
                <Badge className="absolute top-5 left-5 bg-red-500 text-white border-0 text-sm rounded-xl px-3 py-1">
                  -{Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100)}% OFF
                </Badge>
              )}

              <div className="absolute top-5 right-5 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-xl bg-background/80 backdrop-blur-sm ${isFav ? 'text-red-500' : ''}`}
                  onClick={() => setIsFav(!isFav)}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl bg-background/80 backdrop-blur-sm">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${avail.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
                {avail.label}
              </span>
              {medicine.prescriptionRequired && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800 rounded-lg gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Prescription Required
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-1">{medicine.manufacturer}</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 font-sans">{medicine.name}</h1>
            <p className="text-muted-foreground mb-4 font-sans">{medicine.genericName} • {medicine.dosage}</p>

            {medicine.uses && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl mb-4 text-sm font-medium text-right" dir="rtl">
                <strong className="block mb-1 text-emerald-800 dark:text-emerald-300">يستخدم لعلاج:</strong>
                {medicine.uses}
              </div>
            )}

            {medicine.warning && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl mb-4 flex gap-3 text-right" dir="rtl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-red-700 dark:text-red-400 text-sm font-bold mb-1">تحذير طبي مهم</strong>
                  <p className="text-red-600 dark:text-red-300 text-sm leading-relaxed">{medicine.warning}</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(medicine.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{medicine.rating}</span>
              <span className="text-sm text-muted-foreground">({medicine.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6" dir="ltr">
              <span className="text-3xl font-bold text-primary">{medicine.price.toFixed(2)} <span className="text-lg">EGP</span></span>
              {medicine.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {medicine.originalPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 rounded-lg">
                    Save {(medicine.originalPrice - medicine.price).toFixed(2)} EGP
                  </Badge>
                </>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-xl rounded-r-none h-11 w-11"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold tabular-nums">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-r-xl rounded-l-none h-11 w-11"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="flex-1 h-12 rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow text-base"
                disabled={medicine.availability === "out-of-stock"}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart — {(medicine.price * quantity).toFixed(2)} EGP
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, label: "Free Delivery", desc: "On $30+" },
                { icon: Shield, label: "Authentic", desc: "Verified" },
                { icon: Clock, label: "Express", desc: "30 min" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/50 rounded-xl p-3 text-center">
                  <item.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="details" className="rounded-lg flex-1 text-xs">Details</TabsTrigger>
                <TabsTrigger value="dosage" className="rounded-lg flex-1 text-xs">Dosage</TabsTrigger>
                <TabsTrigger value="side-effects" className="rounded-lg flex-1 text-xs">Side Effects</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{medicine.description}</p>
                {medicine.activeIngredients && medicine.activeIngredients.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Active Ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.activeIngredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="rounded-lg text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="dosage" className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {medicine.dosageInstructions || "Please consult your healthcare provider for dosage instructions."}
                </p>
              </TabsContent>
              <TabsContent value="side-effects" className="mt-4">
                {medicine.sideEffects && medicine.sideEffects.length > 0 ? (
                  <ul className="space-y-2">
                    {medicine.sideEffects.map((effect) => (
                      <li key={effect} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {effect}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No known common side effects.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Alternative Medicines */}
        {alternatives.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Alternative Medicines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {alternatives.map((med, i) => (
                <MedicineCard key={med.id} medicine={med} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedMedicines.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedMedicines.map((med, i) => (
                <MedicineCard key={med.id} medicine={med} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
