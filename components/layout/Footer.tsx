"use client";

import Link from "next/link";
import { Pill, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { href: "/search", label: "Browse Medicines" },
  { href: "/prescription", label: "Upload Prescription" },
  { href: "/chat", label: "Ask Pharmacist" },
  { href: "/cart", label: "My Cart" },
  { href: "/dashboard", label: "My Orders" },
];

const categories = [
  { href: "/search?category=pain-relief", label: "Pain Relief" },
  { href: "/search?category=vitamins", label: "Vitamins" },
  { href: "/search?category=cold-flu", label: "Cold & Flu" },
  { href: "/search?category=skincare", label: "Skincare" },
  { href: "/search?category=first-aid", label: "First Aid" },
];

const FacebookIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const socialLinks = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: TwitterIcon, href: "#", label: "Twitter" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Newsletter Section */}
      <div className="gradient-medical-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Get health tips and exclusive offers delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-xl w-full md:w-72 bg-background/80 backdrop-blur-sm"
              />
              <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-medical flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                MedExpress
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Your trusted online pharmacy delivering quality medicines right to
              your doorstep. Licensed, verified, and available 24/7.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-accent hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>123 Medical Center Blvd, Healthcare City, HC 10001</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-foreground/70">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-foreground/70">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>support@medexpress.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <Separator />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            © 2025 MedExpress. Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for better health.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Licenses</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
