"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Moon,
  Sun,
  User,
  Upload,
  Home,
  MessageCircle,
  LayoutDashboard,
  Pill,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useCart } from "@/hooks/useCart";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Medicines", icon: Pill },
  { href: "/search?category=personal-care", label: "العناية الشخصية", icon: Sparkles },
  { href: "/prescription", label: "Upload Rx", icon: Upload },
  { href: "/chat", label: "Ask Pharmacist", icon: MessageCircle },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const pathname = usePathname();
  const { isDark, toggle } = useDarkMode();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white">
                <img src="/logo.jpg" alt="Zayed Pharmacies Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Zayed Pharmacies
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative group/search">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-48 focus:w-64 transition-all rounded-xl h-10 bg-background/50 pl-10"
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (val.length < 2) {
                      setSuggestions([]);
                      return;
                    }
                    try {
                      const res = await fetch(`${API_URL}/api/medicines/suggestions?q=${encodeURIComponent(val)}`);
                      const data = await res.json();
                      setSuggestions(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200) }
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-[60]"
                    >
                      {suggestions.map((s: any) => (
                        <Link 
                          key={s.id} 
                          href={`/medicine/${s.id}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-sm"
                        >
                          <Pill className="w-3 h-3 text-primary" />
                          <span className="truncate">{s.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={toggle}
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Shopping cart">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-medical text-white text-xs flex items-center justify-center font-bold"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" className="text-sm text-right mr-2 hidden xl:block hover:opacity-80 transition-opacity">
                    <p className="font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">My Account</p>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-border/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow px-5">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={toggle}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Cart">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-medical text-white text-xs flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-border/50"
            >
              <div className="px-4 py-4 space-y-2 bg-background/95 backdrop-blur-xl">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Button>
                  </Link>
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full rounded-xl gradient-medical text-white border-0">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-18" />
    </>
  );
}
