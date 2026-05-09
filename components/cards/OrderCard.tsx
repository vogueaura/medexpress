"use client";

import { motion } from "framer-motion";
import { Package, Calendar, RotateCcw, ChevronRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import Link from "next/link";

interface OrderCardProps {
  order: Order;
  index?: number;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

export default function OrderCard({ order, index = 0 }: OrderCardProps) {
  const status = statusConfig[order.status];
  const date = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{order.id}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Items Preview */}
      <div className="space-y-2 mb-4">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.medicine.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-primary/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.medicine.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-medium">${(item.medicine.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-muted-foreground pl-13">
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div>
          <span className="text-xs text-muted-foreground">Total</span>
          <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "delivered" && (
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              Reorder
            </Button>
          )}
          <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs text-primary">
            Details
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
