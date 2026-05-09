"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, MapPin, Package, Bell, Settings, LogOut,
  Edit2, Plus, ChevronRight, ShieldCheck, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OrderCard from "@/components/cards/OrderCard";
import { orders } from "@/data/orders";
import { notifications } from "@/data/offers";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Account</h1>
            <p className="text-muted-foreground">Manage your orders, addresses, and preferences</p>
          </div>
          <Button variant="outline" className="rounded-xl gap-2 w-fit">
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-destructive">Sign Out</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16 border-2 border-border">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Ahmed" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">AH</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">Ahmed Hassan</h3>
                  <p className="text-sm text-muted-foreground">ahmed@example.com</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {[
                  { id: "orders", icon: Package, label: "My Orders" },
                  { id: "addresses", icon: MapPin, label: "Addresses" },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "profile", icon: User, label: "Profile Settings" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === item.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-teal-500/20">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold mb-1">MedExpress Plus</h4>
              <p className="text-sm text-white/80 mb-4">Get free delivery on all orders and exclusive discounts.</p>
              <Button className="w-full bg-white text-teal-700 hover:bg-white/90 rounded-xl">
                Upgrade Now
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentOrders.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" className="rounded-xl">View All Orders</Button>
                </div>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Saved Addresses</h2>
                  <Button className="rounded-xl gradient-medical text-white border-0 h-10 px-4">
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: 1, label: "Home", isDefault: true, street: "15 Tahrir Street, Apt 4B", city: "Cairo, 11511" },
                    { id: 2, label: "Office", isDefault: false, street: "45 Nile Corniche, Floor 8", city: "Cairo, 11519" },
                  ].map((addr) => (
                    <div key={addr.id} className="bg-card rounded-2xl border border-border/50 p-5 relative group">
                      {addr.isDefault && (
                        <div className="absolute top-5 right-5">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase">Default</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{addr.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{addr.street}</p>
                      <p className="text-sm text-muted-foreground mb-4">{addr.city}</p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Edit</Button>
                        {!addr.isDefault && (
                          <Button variant="ghost" size="sm" className="rounded-lg text-xs h-8 text-primary">Set Default</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Mark all as read</Button>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border">
                  {notifications.map((notif) => {
                    const icons = {
                      order: Package,
                      offer: Bell,
                      prescription: ShieldCheck,
                      system: Settings,
                    };
                    const Icon = icons[notif.type];
                    
                    const date = new Date(notif.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

                    return (
                      <div key={notif.id} className={`p-5 flex gap-4 ${!notif.read ? "bg-primary/5" : ""}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notif.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>{notif.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{date}</span>
                          </div>
                          <p className={`text-sm ${!notif.read ? "text-foreground/90" : "text-muted-foreground"}`}>{notif.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                
                <div className="bg-card rounded-3xl border border-border/50 p-6 sm:p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-2 border-border">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Ahmed" />
                        <AvatarFallback>AH</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-2 border-card hover:bg-primary/90">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Profile Photo</h3>
                      <p className="text-sm text-muted-foreground">Update your avatar</p>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue="Ahmed Hassan" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input defaultValue="ahmed@example.com" type="email" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input defaultValue="+20 100 123 4567" type="tel" className="rounded-xl h-11" />
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <h3 className="font-bold text-lg mb-4">Change Password</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input type="password" placeholder="••••••••" className="rounded-xl h-11" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button className="rounded-xl gradient-medical text-white border-0 px-8 h-11">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
