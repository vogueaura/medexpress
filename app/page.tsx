"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Upload, Truck, Clock, Shield, MessageCircle,
  ArrowRight, Pill, Star, ChevronRight, Sparkles,
  Heart, Zap, Package, BadgePercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MedicineCard from "@/components/cards/MedicineCard";
import CategoryCard from "@/components/cards/CategoryCard";
import { categories } from "@/data/categories";
import { medicines as staticMedicines } from "@/data/medicines";
import { offers } from "@/data/offers";
import { API_URL } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch(`${API_URL}/api/medicines`);
        const data = await response.json();
        setMedicines(data);
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
        setMedicines(staticMedicines.slice(0, 8)); // Fallback to static
      } finally {
        setIsLoading(false);
      }
    }
    fetchMedicines();
  }, []);

  const featured = medicines.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-medical-soft" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Smart Pharmacy Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Delivered
                </span>{" "}
                Fast
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Order medicines, upload prescriptions, and get expert pharmacist advice —
                all from the comfort of your home with express delivery.
              </p>

              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search medicines, vitamins, health products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 h-13 rounded-2xl text-base bg-background/80 backdrop-blur-sm border-border/50 shadow-sm focus:shadow-md transition-shadow"
                    />
                  </div>
                  <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
                    <Button className="h-13 px-6 rounded-2xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow">
                      Search
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Link href="/prescription">
                  <Button variant="outline" className="rounded-xl gap-2 bg-background/60 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30">
                    <Upload className="w-4 h-4" />
                    Upload Prescription
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="rounded-xl gap-2 bg-background/60 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30">
                    <MessageCircle className="w-4 h-4" />
                    Ask Pharmacist
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main visual card */}
                <div className="relative bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-8 shadow-2xl shadow-teal-500/20">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                  <div className="relative z-10 text-white">
                    <Pill className="w-16 h-16 mb-6 opacity-90" />
                    <h3 className="text-2xl font-bold mb-2">24/7 Pharmacy</h3>
                    <p className="text-white/80 text-sm mb-6">Licensed pharmacists ready to assist you anytime</p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">380+</p>
                        <p className="text-xs text-white/70">Medicines</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">50K+</p>
                        <p className="text-xs text-white/70">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">4.9★</p>
                        <p className="text-xs text-white/70">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-xl border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Express Delivery</p>
                      <p className="text-xs text-muted-foreground">30 min delivery</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">100% Authentic</p>
                      <p className="text-xs text-muted-foreground">Verified medicines</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-6 border-y border-border/50 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Delivery", desc: "On orders $30+" },
              { icon: Clock, label: "30 Min Express", desc: "Lightning fast" },
              { icon: Shield, label: "100% Authentic", desc: "Licensed pharmacy" },
              { icon: Heart, label: "24/7 Support", desc: "Always here for you" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Shop by Category</h2>
              <p className="text-muted-foreground text-sm">Browse our wide range of health categories</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      <section className="py-16 gradient-medical-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl sm:text-3xl font-bold">Hot Deals</h2>
              </div>
              <p className="text-muted-foreground text-sm">Limited-time offers on popular medicines</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline">
              See All Deals <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((medicine, i) => (
              <MedicineCard key={medicine.id} medicine={medicine} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Offers Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <BadgePercent className="w-5 h-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold">Special Offers</h2>
            </div>
            <p className="text-muted-foreground text-sm">Don&apos;t miss these exclusive deals</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {offers.slice(0, 4).map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br ${offer.color} text-white cursor-pointer shadow-lg`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" />
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-white/85 text-sm mb-4 max-w-xs">{offer.description}</p>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm font-mono text-sm">
                      {offer.code}
                    </Badge>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl backdrop-blur-sm">
                      Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Prescription CTA */}
      <section className="py-16 gradient-medical-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 sm:p-12 border border-border/50 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-20 translate-x-20 blur-3xl" />

            <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <div className="w-16 h-16 rounded-2xl gradient-medical flex items-center justify-center mb-5 shadow-lg shadow-teal-500/25">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Upload Your Prescription
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Simply upload a photo of your prescription and our licensed pharmacists
                  will prepare your medicines. We ensure accuracy and fast processing.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/prescription">
                    <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow px-6">
                      Upload Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button variant="outline" className="rounded-xl">
                      Need Help?
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-64 h-80 rounded-3xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 flex items-center justify-center">
                    <Upload className="w-20 h-20 text-primary/30" />
                  </div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-3 -right-3 bg-card rounded-xl p-3 shadow-lg border border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium">Verified ✓</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ask Pharmacist */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ask a Pharmacist</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              Have questions about your medicines? Our licensed pharmacists are available
              24/7 to provide expert advice and guidance.
            </p>
            <Link href="/chat">
              <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow px-8 h-12 text-base">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Delivery Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-medical p-8 sm:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 translate-x-24 blur-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Truck className="w-14 h-14 mx-auto mb-5 opacity-90" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Lightning-Fast Delivery
              </h2>
              <p className="text-white/85 max-w-lg mx-auto mb-6">
                Get your medicines delivered in as fast as 30 minutes.
                Free delivery on all orders above $30.
              </p>
              <Link href="/search">
                <Button className="bg-white text-teal-700 hover:bg-white/90 rounded-xl px-8 h-12 text-base font-semibold shadow-lg">
                  Order Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
