"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, Minus, Plus, Heart, Share2,
  AlertCircle, Pill, ChevronRight, Shield, Truck,
  Clock, ArrowLeft, Package, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import MedicineCard, { MedicineCardSkeleton } from "@/components/cards/MedicineCard";
import { getMedicineById, getMedicinesByCategory, medicines as staticMedicines } from "@/data/medicines";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Medicine } from "@/types";
import { API_URL } from "@/lib/api";

export default function MedicineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    async function fetchMedicine() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/medicines/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            // Try fallback to static data
            const staticMed = getMedicineById(id);
            if (staticMed) {
              setMedicine(staticMed);
              return;
            }
          }
          throw new Error("Failed to fetch medicine details");
        }
        const data = await response.json();
        setMedicine(data);
      } catch (err) {
        console.error("Fetch error:", err);
        // Fallback to static data as last resort
        const staticMed = getMedicineById(id);
        if (staticMed) {
          setMedicine(staticMed);
        } else {
          setError("Could not load medicine details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchMedicine();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (medicine) {
      if (medicine.availability === "out-of-stock" || medicine.stock === 0) {
        toast.error(`${medicine.name} is out of stock`);
        return;
      }

      addItem(medicine, quantity);
      toast.success(`${medicine.name} added to cart`, {
        description: `Quantity: ${quantity}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Medicine Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {error || "The medicine you're looking for doesn't exist in our database."}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="rounded-xl" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
          <Link href="/search">
            <Button className="rounded-xl gradient-medical text-white border-0">
              Browse All Medicines
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedMedicines = (medicine.category 
    ? getMedicinesByCategory(medicine.category) 
    : staticMedicines.slice(0, 4))
    .filter((m) => m.id !== medicine.id)
    .slice(0, 4);

  const availabilityConfig = {
    "in-stock": { label: "In Stock", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
    "low-stock": { label: "Low Stock", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-500" },
    "out-of-stock": { label: "Out of Stock", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" },
  };

  const avail = availabilityConfig[medicine.availability as keyof typeof availabilityConfig] || availabilityConfig["in-stock"];
  const availableStock = typeof medicine.stock === "number" ? Math.max(0, Math.floor(medicine.stock)) : undefined;
  const isOutOfStock = medicine.availability === "out-of-stock" || availableStock === 0;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-16"
        >
          {/* Left - Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center overflow-hidden border border-border/50 shadow-inner">
              <div className="w-48 h-48 rounded-3xl gradient-medical opacity-10 absolute" />
              <Pill className="w-32 h-32 text-primary/30" />

              {medicine.originalPrice && (
                <Badge className="absolute top-6 left-6 bg-red-500 text-white border-0 text-sm rounded-xl px-3 py-1 shadow-lg">
                  -{Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100)}% OFF
                </Badge>
              )}

              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform ${isFav ? 'text-red-500' : ''}`}
                  onClick={() => setIsFav(!isFav)}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm ${avail.className}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${avail.dot}`} />
                {avail.label}
              </span>
              {medicine.prescriptionRequired && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800 rounded-xl gap-1.5 py-1 px-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Prescription Required
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-primary/70 mb-1">{medicine.manufacturer || "MedExpress Verified"}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{medicine.name}</h1>
            <p className="text-lg text-muted-foreground mb-6 font-sans">
              {medicine.genericName} {medicine.dosage && `• ${medicine.dosage}`}
            </p>

            {medicine.uses && (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl mb-6 text-sm leading-relaxed text-right shadow-sm" dir="rtl">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">دواعي الاستعمال:</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                {medicine.uses}
              </div>
            )}

            {medicine.warning && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl mb-6 flex gap-3 text-right shadow-sm" dir="rtl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-red-800 dark:text-red-300 text-sm font-bold mb-1">تحذير طبي مهم</strong>
                  <p className="text-red-600/80 dark:text-red-400/80 text-sm leading-relaxed">{medicine.warning}</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(medicine.rating || 4.5)
                        ? "text-amber-500 fill-amber-500"
                        : "text-amber-200 dark:text-amber-900"
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400 ml-1.5">
                  {medicine.rating || 4.5}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">({medicine.reviewCount || 120} reviews)</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">98% satisfaction</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8" dir="ltr">
              <div className="flex flex-col">
                <span className="text-4xl font-extrabold text-primary tracking-tight">
                  {medicine.price.toFixed(2)} <span className="text-xl font-bold">EGP</span>
                </span>
                {medicine.originalPrice && (
                   <span className="text-lg text-muted-foreground line-through opacity-70">
                    {medicine.originalPrice.toFixed(2)} EGP
                  </span>
                )}
              </div>
              {medicine.originalPrice && (
                <Badge className="bg-emerald-500 text-white border-0 rounded-xl px-3 py-1.5 font-bold shadow-md">
                  SAVE {(medicine.originalPrice - medicine.price).toFixed(2)} EGP
                </Badge>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
              <div className="flex items-center justify-between border border-border rounded-2xl h-14 px-4 bg-muted/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-background rounded-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-lg font-bold tabular-nums min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-background rounded-xl"
                  disabled={availableStock !== undefined && quantity >= availableStock}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <Button
                className="flex-1 h-14 rounded-2xl gradient-medical text-white border-0 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-95 transition-all text-lg font-bold"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-6 h-6 mr-3" />
                Add to Cart — {(medicine.price * quantity).toFixed(2)} EGP
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: Truck, label: "Express", desc: "30-60 min" },
                { icon: Shield, label: "Authentic", desc: "100% Verified" },
                { icon: Clock, label: "Support", desc: "24/7 Service" },
              ].map((item) => (
                <div key={item.label} className="bg-card/50 rounded-2xl p-4 text-center border border-border/50 hover:border-primary/30 transition-colors group">
                  <item.icon className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full rounded-2xl bg-muted/50 p-1.5 h-12">
                <TabsTrigger value="details" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Details</TabsTrigger>
                <TabsTrigger value="dosage" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Dosage</TabsTrigger>
                <TabsTrigger value="side-effects" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Side Effects</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-5 rounded-2xl border border-border/30">
                  {medicine.description || "No detailed description available for this product."}
                </p>
                {medicine.activeIngredients && medicine.activeIngredients.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Active Ingredients:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.activeIngredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="rounded-xl text-xs px-3 py-1 font-medium bg-primary/5 text-primary border-primary/10">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="dosage" className="mt-6">
                <div className="bg-muted/20 p-5 rounded-2xl border border-border/30">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {medicine.dosageInstructions || "Please consult your healthcare provider or pharmacist for precise dosage instructions based on your condition."}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="side-effects" className="mt-6">
                <div className="bg-muted/20 p-5 rounded-2xl border border-border/30">
                  {medicine.sideEffects && medicine.sideEffects.length > 0 ? (
                    <ul className="space-y-3">
                      {medicine.sideEffects.map((effect) => (
                        <li key={effect} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          {effect}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No common side effects reported for this medication.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedMedicines.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">You might also need</h2>
              <Link href="/search" className="text-sm font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                View more <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
