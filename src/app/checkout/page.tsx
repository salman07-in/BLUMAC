"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Tag,
  CreditCard,
  Banknote,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Chandigarh",
  "Puducherry",
  "Jammu & Kashmir",
  "Ladakh",
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    totalSavings,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
  const [orderNotes, setOrderNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Indian DPDP Act (2023) Statutory Consent States
  const [dataConsent, setDataConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  const [consentError, setConsentError] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-blumac-ivory rounded-full flex items-center justify-center mx-auto text-blumac-copper">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-blumac-navy">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-blumac-slate">
          Add authentic Korean skincare favorites to your bag to proceed to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage(res.message);
    if (res.success) setCouponInput("");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      // DPDP Act 2023 Statutory Consent Validation
      if (!dataConsent) {
        setConsentError(true);
        throw new Error(
          "Data Consent Required: Under India's Digital Personal Data Protection (DPDP) Act, 2023, please give permission to store and process your shipping information before placing your order."
        );
      }

      // PIN validation
      if (!/^\d{6}$/.test(pinCode.trim())) {
        throw new Error("Please enter a valid 6-digit Indian PIN code.");
      }

      const payload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          street,
          landmark,
          city,
          state,
          pinCode: pinCode.trim(),
        },
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        paymentMethod,
        couponCode: appliedCoupon,
        notes: orderNotes,
        dataConsent: true,
        whatsappConsent,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      // If online Razorpay payment with active API key is returned
      if (paymentMethod === "RAZORPAY" && data.razorpayKeyId) {
        // Load Razorpay Checkout SDK dynamically
        const loadScript = () => {
          return new Promise((resolve) => {
            if ((window as any).Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadScript();
        if (loaded && (window as any).Razorpay) {
          const options = {
            key: data.razorpayKeyId,
            amount: Math.round(data.grandTotal * 100),
            currency: "INR",
            name: "BLUMAC Korean Skincare",
            description: `Order ${data.orderNumber}`,
            order_id: data.razorpayOrderId || undefined,
            prefill: {
              name,
              email,
              contact: phone,
            },
            theme: {
              color: "#0B192C",
            },
            handler: async function (response: any) {
              try {
                await fetch("/api/checkout/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderNumber: data.orderNumber,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              } catch (verifyErr) {
                console.error("Signature verification callback error:", verifyErr);
              } finally {
                clearCart();
                router.push(`/order/confirmation/${data.orderNumber}`);
              }
            },
            modal: {
              ondismiss: function () {
                setSubmitting(false);
                clearCart();
                router.push(`/order/confirmation/${data.orderNumber}`);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      }

      // Standard Order completion (COD / Mock / Pending Razorpay)
      clearCart();
      router.push(`/order/confirmation/${data.orderNumber}`);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during checkout.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-blumac-beige">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Secure Checkout
          </h1>
          <p className="text-xs text-blumac-slate mt-0.5">
            100% Genuine Korean Skincare • All-India Express Courier Delivery
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-blumac-forest">
          <ShieldCheck className="w-4 h-4 text-blumac-copper" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Address & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Contact */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blumac-navy text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  Mobile Number (For Courier SMS & Delivery) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blumac-navy mb-1">
                Email Address (For Invoices & Tracking Links) *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blumac-navy text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              All-India Shipping Address
            </h2>

            <div>
              <label className="block text-xs font-semibold text-blumac-navy mb-1">
                Flat, House No., Building, Apartment *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Lotus Heights, 100ft Road"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blumac-navy mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Metro Station / Behind Axis Bank"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  6-Digit PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  State / UT *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper cursor-pointer"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blumac-navy mb-1">
                Delivery Instructions / Order Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with security / Call upon arrival"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>

            <div className="p-3 bg-blumac-ivory rounded-lg border border-blumac-beige text-[11px] text-blumac-slate flex items-center gap-2">
              <Truck className="w-4 h-4 text-blumac-copper shrink-0" />
              <span>
                Standard All-India transit: 2-3 days for Metros, 3-5 days for other regions.
              </span>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blumac-navy text-white text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              Payment Options
            </h2>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "RAZORPAY"
                    ? "border-blumac-copper bg-blumac-copper/5"
                    : "border-blumac-beige hover:border-blumac-slate"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-0.5 accent-blumac-copper"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blumac-copper" />
                    <span className="text-xs font-bold text-blumac-navy">
                      Online Payment (Instant UPI / Cards / NetBanking)
                    </span>
                    <span className="bg-blumac-forest/10 text-blumac-forest text-[9px] font-bold px-1.5 py-0.5 rounded border border-blumac-forest/20">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-blumac-slate mt-0.5">
                    Supports Google Pay, PhonePe, Paytm, RuPay, Visa, MasterCard &amp; NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-blumac-copper bg-blumac-copper/5"
                    : "border-blumac-beige hover:border-blumac-slate"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-0.5 accent-blumac-copper"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-blumac-copper" />
                    <span className="text-xs font-bold text-blumac-navy">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-[11px] text-blumac-slate mt-0.5">
                    Pay in cash directly to the courier agent upon doorstep delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy pb-3 border-b border-blumac-beige">
              Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
            </h2>

            {/* Item Previews */}
            <div className="divide-y divide-blumac-beige/60 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-blumac-ivory rounded-lg overflow-hidden shrink-0 border border-blumac-beige">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-blumac-navy truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-blumac-slate">
                      Qty: {item.quantity} {item.size ? `• ${item.size}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blumac-navy shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="pt-2 border-t border-blumac-beige">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>
                      Coupon <strong>{appliedCoupon}</strong> (-{formatCurrency(couponDiscount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs uppercase text-blumac-navy focus:outline-none focus:border-blumac-copper"
                    />
                    <Tag className="w-3.5 h-3.5 text-blumac-slate absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMessage && !appliedCoupon && (
                <p className="text-[11px] text-blumac-copper font-medium mt-1">
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Pricing Calculation Breakdown */}
            <div className="space-y-2 text-xs text-blumac-charcoal pt-3 border-t border-blumac-beige">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-blumac-copper font-medium">
                  <span>MRP Discount</span>
                  <span>-{formatCurrency(totalSavings)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Coupon Savings</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated All-India Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-blumac-forest">FREE</strong>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-blumac-navy pt-2 border-t border-blumac-beige">
                <span>Total Payable</span>
                <span className="text-blumac-copper">{formatCurrency(grandTotal)}</span>
              </div>
              <p className="text-[10px] text-blumac-slate text-right">
                (Inclusive of 18% GST • ₹{Math.round(subtotal * (18 / 118))} tax included)
              </p>
            </div>

            {/* Indian DPDP Act (2023) Statutory Consent Box */}
            <div
              className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                consentError && !dataConsent
                  ? "bg-red-50/80 border-red-300 ring-2 ring-red-400"
                  : "bg-blumac-ivory/80 border-blumac-beige"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blumac-copper/10 border border-blumac-copper/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-blumac-copper" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-blumac-navy">
                      Data Privacy &amp; Consent Box
                    </span>
                    <span className="px-1.5 py-0.5 bg-blumac-navy text-white text-[9px] font-bold rounded tracking-wider uppercase">
                      DPDP Act 2023
                    </span>
                  </div>
                  <p className="text-[11px] text-blumac-slate mt-0.5 leading-relaxed">
                    Under India&apos;s Digital Personal Data Protection Act, 2023, we require your explicit permission to store your Name, Contact Number, and Shipping Address solely for fulfilling this order, delivery through verified Indian couriers, and generating GST invoices.
                  </p>
                </div>
              </div>

              {/* Mandatory DPDP Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-blumac-beige/80">
                <input
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => {
                    setDataConsent(e.target.checked);
                    if (e.target.checked) setConsentError(false);
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-blumac-copper accent-blumac-copper focus:ring-blumac-copper cursor-pointer"
                />
                <span className="text-[11px] text-blumac-charcoal leading-snug">
                  <strong className="text-blumac-navy">Mandatory:</strong> I consent to BLUMAC collecting, storing, and processing my personal details (Name, Phone &amp; Shipping Address) to fulfill this order and generate tax invoices under India&apos;s DPDP Act, and agree to the{" "}
                  <Link
                    href="/policies/terms"
                    target="_blank"
                    className="text-blumac-copper font-semibold underline hover:text-blumac-navy"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/policies/privacy"
                    target="_blank"
                    className="text-blumac-copper font-semibold underline hover:text-blumac-navy"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Optional WhatsApp/SMS Tracking Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blumac-copper accent-blumac-copper focus:ring-blumac-copper cursor-pointer"
                />
                <span className="text-[11px] text-blumac-charcoal leading-snug">
                  <strong className="text-blumac-forest">Optional:</strong> Send me real-time dispatch tracking, BlueDart/Delhivery AWB status, and order receipts on WhatsApp &amp; SMS.
                </span>
              </label>

              {consentError && !dataConsent && (
                <p className="text-[11px] font-semibold text-red-600 bg-red-100/90 p-2 rounded-lg border border-red-200">
                  ⚠️ Mandatory Consent: Please check the consent box above to proceed with order placement.
                </p>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? "Confirming Order..." : "Place Order & Pay"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center text-[10px] text-blumac-slate space-y-1 pt-1">
              <p className="flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-blumac-copper" /> Safe & Secure 256-Bit SSL Encrypted
              </p>
              <p>Authentic Korean Skincare • CDSCO Compliant Import</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
