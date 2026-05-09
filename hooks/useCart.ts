"use client";

import { useState, useEffect, useCallback } from "react";
import { CartItem, Medicine } from "@/types";

const CART_KEY = "medexpress-cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((medicine: Medicine, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { medicine, quantity }];
    });
  }, []);

  const removeItem = useCallback((medicineId: string) => {
    setItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  }, []);

  const updateQuantity = useCallback((medicineId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.medicine.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 30 ? 0 : 3.99;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    itemCount,
  };
}
