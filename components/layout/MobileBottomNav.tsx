"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Upload, ShoppingCart, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/prescription", label: "Upload", icon: Upload },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/dashboard", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <>
      {/* Spacer so content doesn't get hidden behind the nav */}
      <div className="h-20 lg:hidden" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute -inset-1.5 rounded-xl bg-primary/15"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
