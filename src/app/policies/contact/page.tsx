"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          Dedicated Customer Care
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-blumac-navy">
          Contact BLUMAC Support
        </h1>
        <p className="text-xs sm:text-sm text-blumac-slate leading-relaxed">
          Have an inquiry regarding an order, product recommendations, or shipping? We are here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 bg-blumac-navyDark text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-card border border-blumac-copper/30">
          <div>
            <h3 className="text-lg font-bold font-serif text-white">Get in Touch</h3>
            <p className="text-xs text-blumac-beige mt-1">
              Our beauty and support advisors respond within 2 to 4 business hours.
            </p>
          </div>

          <div className="space-y-4 text-xs text-blumac-beige">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase text-[11px]">Email Inquiries</p>
                <p className="mt-0.5">care@blumac.in</p>
                <p className="text-[10px] text-blumac-slate">General inquiries & order queries</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase text-[11px]">Phone & WhatsApp Helpline</p>
                <div className="mt-1 space-y-1">
                  <p>
                    <a href="tel:6306955690" className="hover:text-blumac-copper transition-colors font-mono">
                      +91 6306955690
                    </a>{" "}
                    <span className="text-[10px] text-blumac-slate">(Primary / WhatsApp)</span>
                  </p>
                  <p>
                    <a href="tel:9519506235" className="hover:text-blumac-copper transition-colors font-mono">
                      +91 9519506235
                    </a>{" "}
                    <span className="text-[10px] text-blumac-slate">(Customer Support)</span>
                  </p>
                  <p>
                    <a href="tel:9559579883" className="hover:text-blumac-copper transition-colors font-mono">
                      +91 9559579883
                    </a>{" "}
                    <span className="text-[10px] text-blumac-slate">(Order Enquiries)</span>
                  </p>
                </div>
                <p className="text-[10px] text-blumac-slate mt-1.5">Mon - Sat: 10:00 AM - 8:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase text-[11px]">Store & Logistics Hub</p>
                <p className="mt-0.5 font-medium text-white">BLUMAC STORE</p>
                <p className="text-[11px] leading-relaxed text-blumac-beige/90">
                  Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar,
                  <br />
                  Shahjahanpur, Uttar Pradesh 242001
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase text-[11px]">Operational Hours</p>
                <p className="mt-0.5">Monday to Saturday: 10:00 AM - 7:00 PM</p>
                <p className="text-[10px] text-blumac-slate">Orders are dispatched 6 days a week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-blumac-navy">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-blumac-slate max-w-sm mx-auto">
                Thank you for reaching out, {name}. A support specialist will get back to you at {email} within 2 to 4 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-blumac-navy text-white text-xs font-bold rounded-full hover:bg-blumac-copper transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-blumac-navy font-serif">
                Send Us a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blumac-navy mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blumac-navy mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ananya@example.com"
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blumac-navy mb-1">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. BLU-82741"
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blumac-navy mb-1">
                    Inquiry Type
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper cursor-pointer"
                  >
                    <option value="general">Skincare Routine Advice</option>
                    <option value="order">Order Tracking & Shipping</option>
                    <option value="damage">Damaged / Replacement Request</option>
                    <option value="wholesale">Brand Partnership & Press</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blumac-navy mb-1">
                  How can we help? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your skin concern, routine questions, or order issue..."
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-3 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Submit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
