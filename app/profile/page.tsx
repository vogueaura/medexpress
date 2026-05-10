"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, CheckCircle2, User, Phone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchOrders();
    }
  }, [user, isAuthLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/orders`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const statusColors: any = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden mb-8 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-border/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          My Orders
        </h2>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border/50 p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <Link href="/">
              <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl border border-border/50 p-6 overflow-hidden flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold">ORD-{order.ID.toString().padStart(5, '0')}</h3>
                    <Badge variant="outline" className={`rounded-lg capitalize ${statusColors[order.Status]}`}>
                      {order.Status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(order.CreatedAt), "MMM dd, yyyy - hh:mm a")}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.Address}, {order.City}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item: any) => (
                      <Badge key={item.ID} variant="secondary" className="rounded-lg font-normal bg-muted">
                        {item.Quantity}x {item.MedicineName}
                      </Badge>
                    ))}
                    {order.items.length > 3 && (
                      <Badge variant="secondary" className="rounded-lg font-normal bg-muted">
                        +{order.items.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-start md:items-end md:border-l border-border/50 md:pl-6">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm text-muted-foreground mb-1 md:text-right">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">{order.TotalAmount.toFixed(2)} <span className="text-sm">EGP</span></p>
                  </div>
                  <Link href={`/track?id=ORD-${order.ID.toString().padStart(5, '0')}`}>
                    <Button variant="outline" className="rounded-xl w-full md:w-auto">
                      Track Order
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
