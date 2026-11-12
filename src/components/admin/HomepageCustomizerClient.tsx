"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layout,
  Sparkles,
  UploadCloud,
  Check,
  RefreshCw,
  AlertTriangle,
  Eye,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sliders,
  ExternalLink,
  Tag,
  Truck,
} from "lucide-react";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage";

interface HomepageCustomizerClientProps {
  initialConfig: HomepageConfig;
}

export function HomepageCustomizerClient({ initialConfig }: HomepageCustomizerClientProps) {
  const [config, setConfig] = useState<HomepageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"hero" | "card" | "pillars" | "preview">("hero");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setConfig((prev) => ({
          ...prev,
          heroCard: {
            ...prev.heroCard,
            imageUrl: data.url,
          },
        }));
        showToast("success", "Hero product image uploaded successfully!");
      } else {
        showToast("error", data.error || "Failed to upload image.");
      }
    } catch {
      showToast("error", "Network error while uploading image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save changes to database
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", "Homepage customized & published successfully!");
      } else {
        showToast("error", data.error || "Failed to save homepage settings.");
      }
    } catch {
      showToast("error", "Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default BLUMAC configuration
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore default homepage text and banner?")) {
      setConfig(DEFAULT_HOMEPAGE_CONFIG);
      showToast("success", "Default settings restored. Click 'Save Changes' to publish.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
            <Layout className="w-4 h-4" />
            <span>Storefront Visual Customizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Homepage &amp; Banner Editor
          </h1>
          <p className="text-xs text-blumac-slate mt-0.5">
            Customize main hero headlines, featured product photo card, trust pillars, and buttons live on blumac.in.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-blumac-copper" />
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3 text-blumac-slate" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2.5 bg-white border border-blumac-beige hover:border-blumac-copper text-blumac-slate hover:text-blumac-navy rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            title="Reset to original defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blumac-copper" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{saving ? "Publishing..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-blumac-beige bg-white rounded-t-2xl px-6 pt-3 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab("hero")}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === "hero"
              ? "border-blumac-copper text-blumac-copper"
              : "border-transparent text-blumac-slate hover:text-blumac-navy"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Hero Banner &amp; Copy</span>
        </button>

        <button
          onClick={() => setActiveTab("card")}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === "card"
              ? "border-blumac-copper text-blumac-copper"
              : "border-transparent text-blumac-slate hover:text-blumac-navy"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>2. Hero Visual Card &amp; Photo</span>
        </button>

        <button
          onClick={() => setActiveTab("pillars")}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
            activeTab === "pillars"
              ? "border-blumac-copper text-blumac-copper"
              : "border-transparent text-blumac-slate hover:text-blumac-navy"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>3. Trust Value Pillars (4 Badges)</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ml-auto ${
            activeTab === "preview"
              ? "border-blumac-copper text-blumac-copper"
              : "border-transparent text-blumac-slate hover:text-blumac-navy"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Hero Preview</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-b-2xl p-6 sm:p-8 border border-t-0 border-blumac-beige shadow-subtle text-xs">
        {/* TAB 1: HERO BANNER & COPY */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="border-b border-blumac-beige pb-4">
              <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider mb-1">
                Hero Tagline &amp; Main Headline
              </h3>
              <p className="text-blumac-slate text-[11px]">
                Controls the main headline, description, and trust pill shown at the top of the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-blumac-navy mb-1">
                  Top Highlight Badge Text
                </label>
                <input
                  type="text"
                  value={config.hero.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, badge: e.target.value },
                    })
                  }
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:ring-1 focus:ring-blumac-copper"
                  placeholder="e.g. Direct from Seoul, South Korea • 100% Genuine"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Headline Prefix (First Words)
                </label>
                <input
                  type="text"
                  value={config.hero.titlePrefix}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, titlePrefix: e.target.value },
                    })
                  }
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                  placeholder="The Pinnacle of"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Headline Highlight (Gradient Text)
                </label>
                <input
                  type="text"
                  value={config.hero.titleHighlight}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, titleHighlight: e.target.value },
                    })
                  }
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                  placeholder="Korean Skincare"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-blumac-navy mb-1">
                  Headline Suffix (Ending Words)
                </label>
                <input
                  type="text"
                  value={config.hero.titleSuffix}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, titleSuffix: e.target.value },
                    })
                  }
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                  placeholder="in India"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-blumac-navy mb-1">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={config.hero.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, description: e.target.value },
                    })
                  }
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy leading-relaxed"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-blumac-beige">
              <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider mb-3">
                Call-to-Action Buttons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={config.hero.primaryCtaText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Primary Button URL Link
                  </label>
                  <input
                    type="text"
                    value={config.hero.primaryCtaLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, primaryCtaLink: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    value={config.hero.secondaryCtaText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Secondary Button URL Link
                  </label>
                  <input
                    type="text"
                    value={config.hero.secondaryCtaLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, secondaryCtaLink: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* 3 Trust Stats */}
            <div className="pt-4 border-t border-blumac-beige">
              <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider mb-3">
                3 Hero Micro Trust Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-2">
                  <span className="font-bold text-blumac-copper block">Stat 1</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. 100%)"
                    value={config.hero.stat1Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat1Value: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 font-bold text-blumac-navy"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Authentic Import)"
                    value={config.hero.stat1Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat1Label: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 text-blumac-slate"
                  />
                </div>

                <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-2">
                  <span className="font-bold text-blumac-copper block">Stat 2</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. ₹999+)"
                    value={config.hero.stat2Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat2Value: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 font-bold text-blumac-navy"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Free All-India Shipping)"
                    value={config.hero.stat2Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat2Label: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 text-blumac-slate"
                  />
                </div>

                <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-2">
                  <span className="font-bold text-blumac-copper block">Stat 3</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. 4.9 ★)"
                    value={config.hero.stat3Value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat3Value: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 font-bold text-blumac-navy"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Loved by 30k+ Indian Users)"
                    value={config.hero.stat3Label}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, stat3Label: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-blumac-beige rounded px-2.5 py-1.5 text-blumac-slate"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO VISUAL CARD & PHOTO */}
        {activeTab === "card" && (
          <div className="space-y-6">
            <div className="border-b border-blumac-beige pb-4">
              <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider mb-1">
                Right-Side Featured Product Showcase Card
              </h3>
              <p className="text-blumac-slate text-[11px]">
                Upload your custom skincare photoshoot image and configure the featured product details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Photo Preview & Upload Controls (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <label className="block font-bold text-blumac-navy">
                  Hero Image (Upload or URL)
                </label>

                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-blumac-beige shadow-md bg-blumac-navy group">
                  <img
                    src={config.heroCard.imageUrl}
                    alt="Hero card preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        DEFAULT_HOMEPAGE_CONFIG.heroCard.imageUrl;
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-blumac-navy">
                    <ShieldCheck className="w-3.5 h-3.5 text-blumac-copper" />
                    <span>{config.heroCard.badgeText}</span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 bg-white/95 p-3 rounded-xl shadow-lg border border-blumac-beige">
                    <span className="text-[9px] uppercase font-bold text-blumac-copper block">
                      {config.heroCard.tag}
                    </span>
                    <h5 className="font-bold text-blumac-navy text-xs truncate">
                      {config.heroCard.title}
                    </h5>
                    <p className="text-[10px] text-blumac-slate truncate">
                      {config.heroCard.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-blumac-ivory hover:bg-blumac-beige border border-blumac-beige rounded-xl font-bold text-blumac-navy flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-blumac-copper" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-blumac-copper" />
                    )}
                    <span>{uploadingImage ? "Uploading Photo..." : "Upload New Photo"}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-blumac-slate mb-1">
                    Or paste external Image URL directly:
                  </label>
                  <input
                    type="url"
                    value={config.heroCard.imageUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroCard: { ...config.heroCard, imageUrl: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Card Meta Settings (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Top Floating Badge Text
                  </label>
                  <input
                    type="text"
                    value={config.heroCard.badgeText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroCard: { ...config.heroCard, badgeText: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                    placeholder="e.g. Verified Batch Codes"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Card Highlight Tag
                  </label>
                  <input
                    type="text"
                    value={config.heroCard.tag}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroCard: { ...config.heroCard, tag: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                    placeholder="e.g. Cult Favorite"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Featured Product Name
                  </label>
                  <input
                    type="text"
                    value={config.heroCard.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroCard: { ...config.heroCard, title: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                    placeholder="e.g. Beauty of Joseon Relief Sun"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Featured Product Subtitle / Formula
                  </label>
                  <input
                    type="text"
                    value={config.heroCard.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroCard: { ...config.heroCard, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                    placeholder="e.g. Rice + Probiotics SPF50+ PA++++"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={config.heroCard.ctaText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          heroCard: { ...config.heroCard, ctaText: e.target.value },
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Button Target Link
                    </label>
                    <input
                      type="text"
                      value={config.heroCard.ctaLink}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          heroCard: { ...config.heroCard, ctaLink: e.target.value },
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRUST VALUE PILLARS (4 BADGES) */}
        {activeTab === "pillars" && (
          <div className="space-y-6">
            <div className="border-b border-blumac-beige pb-4">
              <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider mb-1">
                4 Trust Value Pillars
              </h3>
              <p className="text-blumac-slate text-[11px]">
                These 4 trust badges appear in the floating bar directly below the Hero section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blumac-copper text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-blumac-navy text-xs uppercase tracking-wider">
                      Pillar Badge #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blumac-navy mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const updated = [...config.pillars];
                        updated[idx].title = e.target.value;
                        setConfig({ ...config, pillars: updated });
                      }}
                      className="w-full bg-white border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blumac-navy mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={pillar.desc}
                      onChange={(e) => {
                        const updated = [...config.pillars];
                        updated[idx].desc = e.target.value;
                        setConfig({ ...config, pillars: updated });
                      }}
                      className="w-full bg-white border border-blumac-beige rounded-lg px-3 py-1.5 text-blumac-slate text-xs resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <div>
                <h3 className="text-sm font-bold text-blumac-navy uppercase tracking-wider">
                  Live Hero Banner Preview
                </h3>
                <p className="text-blumac-slate text-[11px]">
                  Real-time preview of how your customized hero banner looks to visitors.
                </p>
              </div>
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 bg-blumac-copper hover:bg-blumac-copperLight text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Publish These Changes</span>
              </button>
            </div>

            {/* Rendered Live Hero Banner */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-blumac-navyDark via-blumac-navy to-blumac-navyDark text-white p-6 sm:p-10 shadow-2xl relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-blumac-copper/40 text-blumac-copperLight text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-blumac-copper" />
                    <span>{config.hero.badge}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-white leading-tight">
                    {config.hero.titlePrefix}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blumac-ivory via-blumac-copperLight to-blumac-copper">
                      {config.hero.titleHighlight}
                    </span>{" "}
                    {config.hero.titleSuffix}
                  </h2>

                  <p className="text-xs text-blumac-beige leading-relaxed max-w-lg">
                    {config.hero.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="px-5 py-2.5 bg-blumac-copper text-white text-xs font-bold uppercase rounded-full shadow-md flex items-center gap-1.5">
                      <span>{config.hero.primaryCtaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold uppercase rounded-full border border-white/20">
                      {config.hero.secondaryCtaText}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div>
                      <p className="font-bold text-white font-serif text-base">{config.hero.stat1Value}</p>
                      <p className="text-[10px] text-blumac-beige">{config.hero.stat1Label}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white font-serif text-base">{config.hero.stat2Value}</p>
                      <p className="text-[10px] text-blumac-beige">{config.hero.stat2Label}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white font-serif text-base">{config.hero.stat3Value}</p>
                      <p className="text-[10px] text-blumac-beige">{config.hero.stat3Label}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-xs aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 bg-blumac-navy">
                    <img
                      src={config.heroCard.imageUrl}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[9px] font-bold text-blumac-navy">
                      <ShieldCheck className="w-3 h-3 text-blumac-copper" />
                      <span>{config.heroCard.badgeText}</span>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 bg-white/95 p-3 rounded-lg shadow-lg border border-blumac-beige flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] uppercase font-bold text-blumac-copper block">
                          {config.heroCard.tag}
                        </span>
                        <h5 className="font-bold text-blumac-navy text-xs truncate">
                          {config.heroCard.title}
                        </h5>
                        <p className="text-[10px] text-blumac-slate truncate">
                          {config.heroCard.subtitle}
                        </p>
                      </div>
                      <span className="px-2.5 py-1.5 bg-blumac-navy text-white text-[10px] font-bold rounded shrink-0">
                        {config.heroCard.ctaText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
