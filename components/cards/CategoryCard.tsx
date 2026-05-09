"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill, Thermometer, Sun, Heart, HeartPulse, Shield,
  Sparkles, Cross, Baby, Apple,
} from "lucide-react";
import { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pill, Thermometer, Sun, Heart, HeartPulse, Shield,
  Sparkles, Cross, Baby, Apple,
};

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Pill;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/search?category=${category.id}`}
        className="block"
      >
        <div className="relative rounded-2xl p-5 text-center overflow-hidden group cursor-pointer bg-card border border-border/50 hover:shadow-lg transition-all duration-300">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300`} />

          <div className={`relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
            <Icon className="w-7 h-7 text-white" />
          </div>

          <h3 className="font-semibold text-sm mb-0.5 relative">{category.name}</h3>
          <p className="text-xs text-muted-foreground relative">{category.count} products</p>
        </div>
      </Link>
    </motion.div>
  );
}
