"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalSavings,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    shippingFee,
    grandTotal,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) setCouponCode("");
  };

  const freeShippingThreshold = 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-blumac-beige">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-blumac-beige flex items-center justify-between bg-blumac-ivory/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blumac-copper" />
              <h2 className="text-base font-bold text-blumac-navy tracking-tight">
                Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-blumac-beige text-blumac-slate hover:text-blumac-navy transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-blumac-ivory border-b border-blumac-beige text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-blumac-charcoal">
                Add <strong className="text-blumac-copper font-bold">{formatCurrency(amountNeededForFreeShipping)}</strong> more to get{" "}
                <span className="font-bold text-blumac-forest">FREE Delivery across India</span>!
              </p>
            ) : (
              <p className="text-blumac-forest font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Congratulations! You unlocked FREE Express Delivery!
              </p>
            )}
            <div className="w-full bg-blumac-beige h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blumac-copper h-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-blumac-beige/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 bg-blumac-ivory rounded-full flex items-center justify-center mb-4 text-blumac-copper">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-blumac-navy">Your bag is empty</h3>
                <p className="text-xs text-blumac-slate mt-1 max-w-xs">
                  Explore our authentic Korean skincare selection imported directly from Seoul.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-blumac-navy text-white text-xs font-semibold rounded-full hover:bg-blumac-copper transition-colors shadow-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  <div className="relative w-20 h-20 bg-blumac-ivory rounded-lg overflow-hidden shrink-0 border border-blumac-beige">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-blumac-copper tracking-wider">
                      {item.brand}
                    </span>
                    <h4 className="text-xs font-semibold text-blumac-navy truncate mt-0.5">
                      {item.name}
                    </h4>
                    {item.size && (
                      <span className="text-[11px] text-blumac-slate block">
                        Size: {item.size}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-blumac-navy">
                        {formatCurrency(item.price)}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-blumac-slate line-through">
                          {formatCurrency(item.mrp)}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-blumac-beige rounded-md overflow-hidden bg-blumac-ivory">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-blumac-navy hover:bg-blumac-beige transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-blumac-navy min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-blumac-navy hover:bg-blumac-beige transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-blumac-slate hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-blumac-beige p-4 sm:p-6 bg-blumac-ivory/30 space-y-4">
              {/* Coupon input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-xs text-green-800">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>
                        Coupon <strong>{appliedCoupon}</strong> active (-{formatCurrency(couponDiscount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Coupon Code (e.g. SEOUL10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-white border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy uppercase focus:outline-none focus:border-blumac-copper"
                      />
                      <Tag className="w-3.5 h-3.5 text-blumac-slate absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMsg && !appliedCoupon && (
                  <p
                    className={`text-[11px] mt-1.5 ${
                      couponMsg.success ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-blumac-charcoal pt-2 border-t border-blumac-beige/60">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-blumac-copper font-medium">
                    <span>Retail MRP Savings</span>
                    <span>-{formatCurrency(totalSavings)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-blumac-forest">FREE</strong> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-blumac-navy pt-2 border-t border-blumac-beige">
                  <span>Final Payable</span>
                  <span className="text-base text-blumac-copper">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
