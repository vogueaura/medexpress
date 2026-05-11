"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, AlertCircle, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Medicine } from "@/types";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface MedicineCardProps {
  medicine: Medicine;
  index?: number;
}

export default function MedicineCard({ medicine, index = 0 }: MedicineCardProps) {
  const { addItem } = useCart();

  const availabilityConfig = {
    "in-stock": { label: "In Stock", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    "low-stock": { label: "Low Stock", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
    "out-of-stock": { label: "Out of Stock", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  };

  const availabilityKey = medicine.availability || "in-stock";
  const availability = availabilityConfig[availabilityKey as keyof typeof availabilityConfig] || availabilityConfig["in-stock"];
  const isOutOfStock = medicine.availability === "out-of-stock" || medicine.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image Area */}
        <Link href={`/medicine/${medicine.id}`}>
          <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-center overflow-hidden">
            <div className="w-24 h-24 rounded-2xl gradient-medical opacity-10 absolute" />
            <Pill className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />

            {/* Discount Badge */}
            {medicine.originalPrice && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-500 text-white border-0 text-xs font-bold rounded-lg">
                  -{Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100)}%
                </Badge>
              </div>
            )}

            {/* Prescription / Warning Badge */}
            {(medicine.prescriptionRequired || medicine.warning) && (
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800 text-xs rounded-lg gap-1 font-bold">
                  <AlertCircle className="w-3 h-3" />
                  تحذير طبي
                </Badge>
              </div>
            )}

            {/* Availability */}
            <div className="absolute bottom-3 left-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${availability.className}`}>
                {availability.label}
              </span>
            </div>
          </div>
        </Link>

        {/* Info */}
        <div className="p-4" dir="rtl">
          <Link href={`/medicine/${medicine.id}`}>
            <p className="text-xs text-muted-foreground mb-1 font-sans">{medicine.manufacturer || "Generic"}</p>
            <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 font-sans min-h-[2.5rem] flex items-center">
              {medicine.name}
            </h3>
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1 font-sans" dir="ltr">{medicine.genericName || medicine.name}</p>
            {medicine.description && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 line-clamp-2 font-medium bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md">
                <span className="font-bold block mb-0.5">يستخدم لعلاج:</span>
                {medicine.description}
              </p>
            )}
            {!medicine.description && medicine.uses && (
               <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 line-clamp-1 font-medium bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-md">
                {medicine.uses}
              </p>
            )}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium">{medicine.rating || 4.5}</span>
            <span className="text-xs text-muted-foreground">({medicine.reviewCount || 10})</span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-1.5" dir="ltr">
              <span className="text-lg font-bold text-primary">{medicine.price?.toFixed(2) || "0.00"} <span className="text-xs">EGP</span></span>
              {medicine.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {medicine.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              className="rounded-xl gradient-medical text-white border-0 shadow-md shadow-teal-500/20 hover:shadow-teal-500/40 transition-shadow h-8 px-3"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOutOfStock) {
                  toast.error(`${medicine.name} is out of stock`);
                  return;
                }
                addItem(medicine);
                toast.success(`${medicine.name} added to cart`);
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              {isOutOfStock ? "Out" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MedicineCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded-full w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-muted rounded-full w-1/2 animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-muted rounded-full w-16 animate-pulse" />
          <div className="h-8 bg-muted rounded-xl w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
