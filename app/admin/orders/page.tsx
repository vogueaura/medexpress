"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Clock, CheckCircle2, XCircle, 
  ChevronRight, Search, Filter, Phone, MapPin, CreditCard, Wallet,
  MessageCircle, FileImage, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { API_URL } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    // Quick client-side check
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchOrders(true);

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 10000); // 10 seconds polling

    return () => clearInterval(intervalId);
  }, []);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        credentials: "include"
      });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      if (showLoading) toast.error("Failed to load orders");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (response.ok) {
        toast.success(`Order status updated to ${status}`);
        fetchOrders(false);
        if (selectedOrder && selectedOrder.ID === id) {
          setSelectedOrder({ ...selectedOrder, Status: status });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const statusColors: any = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-muted-foreground">Manage and track all customer orders in real-time.</p>
          </div>
          <Button 
            variant="ghost" 
            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={async () => {
              try {
                await fetch(`${API_URL}/api/admin/logout`, {
                  method: 'POST',
                  credentials: 'include' 
                });
              } catch (e) {
                console.error(e);
              }
              localStorage.removeItem('isAdmin');
              router.push("/admin/login");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9 rounded-xl bg-background" />
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-card rounded-2xl border border-border/50">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.ID} 
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedOrder?.ID === order.ID 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border/50 bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">ORD-{order.ID.toString().padStart(5, '0')}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.CreatedAt), "MMM dd, hh:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className={`rounded-lg capitalize ${statusColors[order.Status]}`}>
                      {order.Status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{order.CustomerName}</p>
                    <p className="font-bold text-primary">{order.TotalAmount.toFixed(2)} EGP</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
                  <div>
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <p className="text-sm text-muted-foreground">ORD-{selectedOrder.ID.toString().padStart(5, '0')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl bg-background border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        const phone = selectedOrder.CustomerPhone.replace(/\s+/g, '');
                        const msg = `أهلاً أستاذ ${selectedOrder.CustomerName}، طلبك رقم ORD-${selectedOrder.ID.toString().padStart(5, '0')} من صيدلية زايد جاهز وجاري التوصيل.`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl bg-background"
                      onClick={() => updateStatus(selectedOrder.ID, "cancelled")}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-xl gradient-medical text-white border-0"
                      onClick={() => {
                        const nextStatus = selectedOrder.Status === 'pending' ? 'preparing' : 
                                         selectedOrder.Status === 'preparing' ? 'shipped' : 'delivered';
                        updateStatus(selectedOrder.ID, nextStatus);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> 
                      {selectedOrder.Status === 'pending' ? 'Prepare Order' : 
                       selectedOrder.Status === 'preparing' ? 'Ship Order' : 'Mark Delivered'}
                    </Button>
                  </div>
                </div>

                <div className="p-6 grid sm:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Customer Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedOrder.CustomerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{selectedOrder.CustomerPhone}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <span>{selectedOrder.Address}, {selectedOrder.City}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {selectedOrder.PaymentMethod === 'instapay-vodafone' ? <Wallet className="w-4 h-4 text-purple-600" /> : <CreditCard className="w-4 h-4 text-primary" />}
                        <span className="capitalize">{selectedOrder.PaymentMethod.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prescription */}
                  {selectedOrder.PrescriptionPath && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Prescription</h3>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 group">
                        <img 
                          src={`${API_URL}${selectedOrder.PrescriptionPath}`}
                          alt="Prescription" 
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(`${API_URL}${selectedOrder.PrescriptionPath}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Button variant="secondary" size="sm" className="rounded-xl">Click to Enlarge</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Update Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['pending', 'preparing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <Button 
                          key={s}
                          variant="outline" 
                          size="sm" 
                          className={`rounded-lg capitalize h-9 text-[10px] ${selectedOrder.Status === s ? statusColors[s] : ""}`}
                          onClick={() => updateStatus(selectedOrder.ID, s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="px-6 pb-6">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Ordered Items</h3>
                  <div className="rounded-2xl border border-border/50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Medicine</th>
                          <th className="px-4 py-3 font-semibold text-center">Qty</th>
                          <th className="px-4 py-3 font-semibold text-right">Price</th>
                          <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {selectedOrder.items.map((item: any) => (
                          <tr key={item.ID} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">{item.MedicineName}</td>
                            <td className="px-4 py-3 text-center">{item.Quantity}</td>
                            <td className="px-4 py-3 text-right">{item.Price.toFixed(2)} EGP</td>
                            <td className="px-4 py-3 text-right font-bold">{(item.Price * item.Quantity).toFixed(2)} EGP</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/30">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-bold">Total</td>
                          <td className="px-4 py-3 text-right font-bold text-primary text-lg">{selectedOrder.TotalAmount.toFixed(2)} EGP</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ChevronRight className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select an order to view details</h3>
                <p className="text-muted-foreground">Choose an order from the list on the left to manage it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
