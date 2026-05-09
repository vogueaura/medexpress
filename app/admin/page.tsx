"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, Users, Pill, Settings,
  LogOut, Search, TrendingUp, DollarSign, Package, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminStats, adminRevenueData } from "@/data/offers";
import { orders } from "@/data/orders";
import { medicines } from "@/data/medicines";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col h-auto md:min-h-screen sticky top-0">
        <div className="p-6 border-b border-border flex items-center justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-medical flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "orders", label: "Orders", icon: ShoppingCart },
              { id: "medicines", label: "Medicines", icon: Pill },
              { id: "customers", label: "Customers", icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Super Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@medexpress.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-lg justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-hidden w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 rounded-xl bg-card border-border/50" />
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `$${adminStats.totalRevenue.toLocaleString()}`, change: `+${adminStats.revenueChange}%`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Total Orders", value: adminStats.totalOrders.toLocaleString(), change: `+${adminStats.ordersChange}%`, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Active Users", value: adminStats.activeUsers.toLocaleString(), change: `+${adminStats.usersChange}%`, icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Total Medicines", value: adminStats.totalMedicines.toLocaleString(), change: `+${adminStats.medicinesChange}%`, icon: Pill, color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <TrendingUp className="w-3 h-3" /> {stat.change}
                    </span>
                  </div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="font-bold mb-6">Revenue Overview</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={adminRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="font-bold mb-6">Orders Overview</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adminRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        cursor={{ fill: "hsl(var(--muted))" }}
                      />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders Table Preview */}
            <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Recent Orders</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-primary hover:text-primary hover:bg-primary/10">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{order.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{order.deliveryAddress.fullName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            order.status === "delivered" ? "bg-emerald-500/10 text-emerald-500" :
                            order.status === "processing" ? "bg-blue-500/10 text-blue-500" :
                            order.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                            "bg-amber-500/10 text-amber-500"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">${order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Medicines Tab */}
        {activeTab === "medicines" && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Medicines Inventory</h3>
              <Button className="rounded-xl gradient-medical text-white border-0 h-9">
                + Add Medicine
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 rounded-tr-lg font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Pill className="w-4 h-4 text-primary/50" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{med.name}</p>
                            <p className="text-xs text-muted-foreground">{med.genericName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{med.category.replace("-", " ")}</td>
                      <td className="px-4 py-3 font-medium">${med.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          med.availability === "in-stock" ? "bg-emerald-500/10 text-emerald-500" :
                          med.availability === "low-stock" ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          {med.availability.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
