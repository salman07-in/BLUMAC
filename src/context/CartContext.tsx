"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  image: string;
  size?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  subtotal: number;
  totalSavings: number;
  itemCount: number;
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  shippingFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("blumac_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem("blumac_coupon");
      if (savedCoupon) {
        setAppliedCoupon(savedCoupon);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("blumac_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("blumac_cart");
      localStorage.removeItem("blumac_coupon");
    } catch {
      // ignore
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalMrp = items.reduce(
    (sum, item) => sum + item.mrp * item.quantity,
    0
  );

  const totalSavings = Math.max(0, totalMrp - subtotal);

  // Dynamic Coupon Engine Calculation
  let couponDiscount = 0;
  if (appliedCoupon === "SEOUL10") {
    // 10% off entire order
    couponDiscount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === "FIRSTORDER") {
    // ₹200 off on minimum ₹999
    if (subtotal >= 999) {
      couponDiscount = 200;
    }
  } else if (appliedCoupon === "KBEAUTY25") {
    // 25% off up to ₹500
    couponDiscount = Math.min(500, Math.round(subtotal * 0.25));
  }

  // Free shipping threshold: ₹999 across India
  const shippingFee = subtotal === 0 || subtotal >= 999 ? 0 : 99;

  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "SEOUL10") {
      setAppliedCoupon("SEOUL10");
      localStorage.setItem("blumac_coupon", "SEOUL10");
      return { success: true, message: "Coupon 'SEOUL10' applied: 10% instant discount!" };
    }
    if (cleanCode === "FIRSTORDER") {
      if (subtotal < 999) {
        return {
          success: false,
          message: "Coupon 'FIRSTORDER' requires minimum order value of ₹999.",
        };
      }
      setAppliedCoupon("FIRSTORDER");
      localStorage.setItem("blumac_coupon", "FIRSTORDER");
      return { success: true, message: "Welcome offer applied: ₹200 OFF!" };
    }
    if (cleanCode === "KBEAUTY25") {
      setAppliedCoupon("KBEAUTY25");
      localStorage.setItem("blumac_coupon", "KBEAUTY25");
      return { success: true, message: "Special offer: 25% OFF (Max ₹500) applied!" };
    }
    return {
      success: false,
      message: "Invalid or expired coupon code. Try SEOUL10 for 10% off.",
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("blumac_coupon");
    } catch {
      // ignore
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        subtotal,
        totalSavings,
        itemCount,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        shippingFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
