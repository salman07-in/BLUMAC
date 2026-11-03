"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, MapPin, Phone, Mail, Edit3, Trash2,
  Plus, CheckCircle2, Star, Save, X, Home
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

interface Address {
  id: string; fullName: string; phone: string; street: string;
  landmark?: string; city: string; state: string; pinCode: string; isDefault: boolean;
}

const emptyAddr = (): Omit<Address, "id"> => ({
  fullName: "", phone: "", street: "", landmark: "", city: "", state: "", pinCode: "", isDefault: false,
});

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState(emptyAddr());
  const [addrMsg, setAddrMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/auth/login"); return; }
        setUser(d.user);
        setProfileName(d.user.name || "");
        setProfilePhone(d.user.phone || "");
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
    loadAddresses();
  }, [router]);

  const loadAddresses = () => {
    setAddrLoading(true);
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((d) => { if (d.addresses) setAddresses(d.addresses); })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, phone: profilePhone || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev: any) => ({ ...prev, name: data.user.name, phone: data.user.phone }));
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      } else {
        setProfileMsg({ type: "error", text: data.error || "Update failed" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const openAddAddrForm = () => {
    setEditingAddr(null);
    setAddrForm(emptyAddr());
    setShowAddrForm(true);
  };

  const openEditAddrForm = (addr: Address) => {
    setEditingAddr(addr);
    setAddrForm({ fullName: addr.fullName, phone: addr.phone, street: addr.street, landmark: addr.landmark || "", city: addr.city, state: addr.state, pinCode: addr.pinCode, isDefault: addr.isDefault });
    setShowAddrForm(true);
  };

  const handleAddrSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrMsg(null);
    try {
      const url = editingAddr ? `/api/account/addresses/${editingAddr.id}` : "/api/account/addresses";
      const method = editingAddr ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(addrForm) });
      const data = await res.json();
      if (res.ok) {
        setAddrMsg({ type: "success", text: editingAddr ? "Address updated!" : "Address added!" });
        setShowAddrForm(false);
        loadAddresses();
      } else {
        setAddrMsg({ type: "error", text: data.error || "Failed to save address" });
      }
    } catch {
      setAddrMsg({ type: "error", text: "Network error." });
    } finally {
      setAddrSaving(false);
      setTimeout(() => setAddrMsg(null), 3000);
    }
  };

  const handleAddrDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (res.ok) loadAddresses();
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/account/addresses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) });
      loadAddresses();
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-blumac-slate uppercase tracking-wider font-semibold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Back */}
      <Link href="/account" className="text-xs font-semibold text-blumac-slate hover:text-blumac-navy flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card flex items-center gap-5">
        <div className="w-16 h-16 bg-blumac-navy rounded-full flex items-center justify-center text-white text-2xl font-bold font-serif border-2 border-blumac-copper shrink-0">
          {user?.name?.[0]?.toUpperCase() || "B"}
        </div>
        <div>
          <h1 className="text-xl font-bold font-serif text-blumac-navy">{user?.name}</h1>
          <p className="text-xs text-blumac-slate">{user?.email}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blumac-copper">K-Beauty Member</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blumac-beige">
        {(["profile", "addresses"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? "border-b-2 border-blumac-copper text-blumac-copper" : "text-blumac-slate hover:text-blumac-navy"}`}
          >
            {tab === "profile" ? <><User className="w-3.5 h-3.5 inline mr-1.5" />My Profile</> : <><MapPin className="w-3.5 h-3.5 inline mr-1.5" />My Addresses ({addresses.length})</>}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card">
          <h2 className="text-base font-bold text-blumac-navy mb-6 flex items-center gap-2"><Edit3 className="w-4 h-4 text-blumac-copper" /> Edit Profile</h2>
          {profileMsg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${profileMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              <CheckCircle2 className="w-4 h-4" /> {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-blumac-slate uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required minLength={2}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-4 py-2.5 text-sm text-blumac-navy focus:outline-none focus:border-blumac-copper transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blumac-slate uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" value={user?.email || ""} disabled
                  className="w-full bg-gray-50 border border-blumac-beige rounded-lg px-4 py-2.5 text-sm text-blumac-slate cursor-not-allowed" />
                <p className="text-[10px] text-blumac-slate mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-blumac-slate uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blumac-slate">+91</span>
                  <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="9876543210" maxLength={10}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg pl-10 pr-4 py-2.5 text-sm text-blumac-navy focus:outline-none focus:border-blumac-copper transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={profileSaving}
                className="px-8 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
                <Save className="w-3.5 h-3.5" /> {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          {addrMsg && (
            <div className={`px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${addrMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              <CheckCircle2 className="w-4 h-4" /> {addrMsg.text}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2"><Home className="w-4 h-4 text-blumac-copper" /> Saved Addresses</h2>
            <button onClick={openAddAddrForm} className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {addrLoading ? (
            <div className="py-10 text-center"><div className="w-8 h-8 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : addresses.length === 0 && !showAddrForm ? (
            <div className="bg-white rounded-2xl p-10 border border-blumac-beige text-center space-y-3">
              <MapPin className="w-10 h-10 text-blumac-copper/50 mx-auto" />
              <p className="text-sm font-bold text-blumac-navy">No saved addresses</p>
              <p className="text-xs text-blumac-slate">Add a delivery address to speed up checkout.</p>
              <button onClick={openAddAddrForm} className="inline-block px-6 py-2.5 bg-blumac-navy text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-blumac-copper transition-colors">
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`bg-white rounded-xl p-5 border shadow-subtle space-y-3 ${addr.isDefault ? "border-blumac-copper" : "border-blumac-beige"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blumac-navy">{addr.fullName}</span>
                      {addr.isDefault && <span className="text-[10px] font-bold bg-blumac-copper text-white px-2 py-0.5 rounded-full uppercase">Default</span>}
                    </div>
                  </div>
                  <div className="text-xs text-blumac-slate space-y-0.5">
                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {addr.phone}</p>
                    <p>{addr.street}{addr.landmark ? `, ${addr.landmark}` : ""}</p>
                    <p>{addr.city}, {addr.state} – {addr.pinCode}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-blumac-beige/60">
                    <button onClick={() => openEditAddrForm(addr)} className="flex items-center gap-1 text-[11px] font-bold text-blumac-navy hover:text-blumac-copper transition-colors">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleAddrDelete(addr.id)} className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors ml-2">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} className="flex items-center gap-1 text-[11px] font-bold text-blumac-slate hover:text-blumac-copper transition-colors ml-auto">
                        <Star className="w-3 h-3" /> Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Address Form */}
          {showAddrForm && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-copper shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-blumac-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blumac-copper" />
                  {editingAddr ? "Edit Address" : "Add New Address"}
                </h3>
                <button onClick={() => setShowAddrForm(false)} className="p-1.5 rounded-full hover:bg-blumac-ivory text-blumac-slate"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleAddrSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { field: "fullName", label: "Full Name", placeholder: "e.g. Priya Sharma", type: "text" },
                    { field: "phone", label: "Mobile Number", placeholder: "10-digit mobile", type: "tel" },
                    { field: "street", label: "Street Address", placeholder: "House/Flat, Building, Area", type: "text" },
                    { field: "landmark", label: "Landmark (optional)", placeholder: "Near, Opposite...", type: "text" },
                    { field: "city", label: "City", placeholder: "e.g. Mumbai", type: "text" },
                    { field: "pinCode", label: "PIN Code", placeholder: "6-digit PIN", type: "text" },
                  ] as const).map(({ field, label, placeholder, type }) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-blumac-slate uppercase tracking-wider mb-1.5">{label}</label>
                      <input type={type} placeholder={placeholder} value={(addrForm as any)[field] || ""}
                        onChange={(e) => setAddrForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        required={field !== "landmark"}
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-4 py-2.5 text-sm text-blumac-navy focus:outline-none focus:border-blumac-copper" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-blumac-slate uppercase tracking-wider mb-1.5">State</label>
                    <select value={addrForm.state} onChange={(e) => setAddrForm((prev) => ({ ...prev, state: e.target.value }))} required
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-4 py-2.5 text-sm text-blumac-navy focus:outline-none focus:border-blumac-copper">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 accent-blumac-copper" />
                  <span className="text-xs font-semibold text-blumac-navy">Set as default address</span>
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={addrSaving}
                    className="px-8 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" /> {addrSaving ? "Saving..." : "Save Address"}
                  </button>
                  <button type="button" onClick={() => setShowAddrForm(false)}
                    className="px-6 py-2.5 bg-blumac-ivory text-blumac-navy text-xs font-bold rounded-lg hover:bg-blumac-beige transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
