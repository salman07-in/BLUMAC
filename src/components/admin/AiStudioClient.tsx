"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  Sparkles,
  Download,
  Check,
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Layers,
  FileText,
  Globe,
  Share2,
} from "lucide-react";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import { formatCurrency } from "@/lib/utils";

const CREATIVE_TEMPLATES = [
  { id: "spotlight", name: "Product Spotlight", badge: "Editorial Luxury" },
  { id: "new-arrival", name: "New Arrival: Direct from Seoul", badge: "Trending" },
  { id: "promo-offer", name: "Launch Deal: 10% OFF", badge: "Promotional" },
  { id: "benefits", name: "3-Active Benefits Breakdown", badge: "Clinical" },
  { id: "routine", name: "Step 03: Glass Skin Routine", badge: "Regimen" },
  { id: "seasonal", name: "Summer Barrier Hydration", badge: "Seasonal" },
  { id: "social-post", name: "Instagram Square (1080×1080)", badge: "Social Media" },
];

export function AiStudioClient() {
  // Input Product Meta
  const [productName, setProductName] = useState("Relief Sun: Rice + Probiotics");
  const [brand, setBrand] = useState("Beauty of Joseon");
  const [keyIngredient, setKeyIngredient] = useState("Rice Extract 30% + Grain Probiotics");
  const [skinBenefit, setSkinBenefit] = useState("Zero white cast daily UV shield & glass skin hydration");
  const [price, setPrice] = useState("1149");
  const [mrp, setMrp] = useState("1400");
  const [selectedTemplate, setSelectedTemplate] = useState("spotlight");

  // Camera & Image States
  const [capturedImage, setCapturedImage] = useState<string>(
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
  );
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Copy Generation States
  const [generating, setGenerating] = useState(false);
  const [isDevMode, setIsDevMode] = useState(true);
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      alert("Unable to access camera. Please allow camera permissions or upload an image.");
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
        alert("Please upload a PNG, JPG, or WEBP image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCapturedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render Creative onto HTML5 Canvas
  const drawCreativeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background: Warm Ivory with subtle vignette
    ctx.fillStyle = "#F8F5EF";
    ctx.fillRect(0, 0, width, height);

    // Decorative Korean Geometry Frame
    ctx.strokeStyle = "#C77B64";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = "#142B50";
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, width - 76, height - 76);

    // Top Brand Header Banner
    ctx.fillStyle = "#142B50";
    ctx.fillRect(40, 40, width - 80, 80);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("BLUMAC KOREAN STORE", width / 2, 85);

    ctx.fillStyle = "#C77B64";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("100% GENUINE IMPORT • DIRECT FROM SEOUL", width / 2, 105);

    // Load & Render Product Image in Center
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = capturedImage;
    img.onload = () => {
      // Draw circular or rounded card backing
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(width / 2, 360, 190, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#E8E3DA";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clip image within circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, 360, 185, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, width / 2 - 185, 360 - 185, 370, 370);
      ctx.restore();

      // Badge over product
      ctx.fillStyle = "#142B50";
      ctx.beginPath();
      ctx.roundRect(width / 2 - 140, 140, 280, 32, 16);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        selectedTemplate === "new-arrival"
          ? "✨ JUST LANDED FROM KOREA"
          : selectedTemplate === "promo-offer"
          ? "🔥 SPECIAL LAUNCH OFFER: 10% OFF"
          : "✨ CULT KOREAN SKINCARE",
        width / 2,
        161
      );

      // Product Title & Brand
      ctx.fillStyle = "#C77B64";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(brand.toUpperCase(), width / 2, 595);

      ctx.fillStyle = "#142B50";
      ctx.font = "bold 24px 'Playfair Display', Georgia, serif";
      ctx.fillText(productName, width / 2, 628);

      // Key ingredient snippet
      ctx.fillStyle = "#5A6578";
      ctx.font = "italic 13px system-ui, sans-serif";
      ctx.fillText(`Key Active: ${keyIngredient}`, width / 2, 655);

      // Price Tag Box at Bottom
      ctx.fillStyle = "#142B50";
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, 680, 360, 56, 12);
      ctx.fill();

      ctx.fillStyle = "#DE9984";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `SPECIAL: ${formatCurrency(parseFloat(price) || 1149)}`,
        width / 2 - 40,
        715
      );

      if (parseFloat(mrp) > parseFloat(price)) {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText(`MRP: ${formatCurrency(parseFloat(mrp))}`, width / 2 + 100, 715);
      }
    };
  };

  useEffect(() => {
    drawCreativeCanvas();
  }, [capturedImage, productName, brand, keyIngredient, price, mrp, selectedTemplate]);

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `blumac-creative-${brand.toLowerCase()}-${selectedTemplate}.png`;
    a.click();
  };

  // Run AI Copy Generation
  const handleGenerateCopy = async () => {
    setGenerating(true);
    setApproved(false);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          brand,
          keyIngredient,
          skinBenefit,
          price: parseFloat(price) || 1199,
          templateType: selectedTemplate,
        }),
      });
      const data = await res.json();
      if (data.copy) {
        setGeneratedCopy(data.copy);
        setIsDevMode(data.isMock);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
            <Sparkles className="w-4 h-4 text-blumac-copper" />
            <span>AI Product Studio & Creative Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Branded Creative & Copy Generator
          </h1>
          <p className="text-xs text-blumac-slate mt-0.5">
            Capture skincare packaging, generate branded Korean creatives, and produce multilingual social media copy.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blumac-ivory border border-blumac-beige px-3 py-1.5 rounded-full text-xs font-semibold text-blumac-navy">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Studio Engine: Ready</span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Capture & Creative Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Capture Controls */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <Camera className="w-4 h-4 text-blumac-copper" />
              1. Capture or Upload Skincare Packaging
            </h2>

            {cameraActive ? (
              <div className="space-y-3">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={takeSnapshot}
                    className="flex-1 py-2 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                  >
                    Take Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>

                <label className="flex-1 py-3 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                  <Upload className="w-4 h-4 text-blumac-copper" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <Layers className="w-4 h-4 text-blumac-copper" />
              2. Select Creative Template
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CREATIVE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    selectedTemplate === tmpl.id
                      ? "border-blumac-copper bg-blumac-copper/10 font-bold text-blumac-navy shadow-sm"
                      : "border-blumac-beige bg-blumac-ivory text-blumac-slate hover:border-blumac-copper"
                  }`}
                >
                  <span className="block truncate">{tmpl.name}</span>
                  <span className="text-[10px] text-blumac-copper block mt-0.5">
                    {tmpl.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Preview & Download */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blumac-copper" />
                Live Generated Creative Canvas
              </h3>
              <button
                onClick={downloadCanvasImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blumac-copper hover:bg-blumac-copperLight text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-blumac-beige shadow-inner bg-blumac-ivory flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Skincare Data & AI Copywriting (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Verified Product Inputs */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <FileText className="w-4 h-4 text-blumac-copper" />
              Verified Skincare Specifications
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-blumac-navy mb-1">
                Key Active Ingredient *
              </label>
              <input
                type="text"
                value={keyIngredient}
                onChange={(e) => setKeyIngredient(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>

            <div>
              <label className="block font-semibold text-blumac-navy mb-1">
                Target Skin Benefit / Texture *
              </label>
              <input
                type="text"
                value={skinBenefit}
                onChange={(e) => setSkinBenefit(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCopy}
              disabled={generating}
              className="w-full py-3.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blumac-copperLight" />
              <span>{generating ? "Drafting Content..." : "Generate AI Copy & Captions"}</span>
            </button>
          </div>

          {/* Generated Copy Output */}
          {generatedCopy && (
            <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy">
                    AI Studio Generated Content
                  </h3>
                  {isDevMode && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                      ⚡ Local Development Mode (Template-Based Engine)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setApproved(true)}
                  disabled={approved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    approved
                      ? "bg-green-600 text-white"
                      : "bg-blumac-navy hover:bg-blumac-copper text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{approved ? "Approved & Ready" : "Admin Approve"}</span>
                </button>
              </div>

              {/* Title & Descriptions */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blumac-navy">Refined Product Title:</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.title, "title")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "title" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-navy font-semibold border border-blumac-beige">
                    {generatedCopy.title}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blumac-navy">Short Description:</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.shortDescription, "short")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "short" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-charcoal border border-blumac-beige leading-relaxed">
                    {generatedCopy.shortDescription}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blumac-navy">SEO Meta Description:</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.seoDescription, "seo")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "seo" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-slate border border-blumac-beige font-mono text-[11px]">
                    {generatedCopy.seoDescription}
                  </p>
                </div>
              </div>

              {/* Multilingual Social Media Captions */}
              <div className="pt-4 border-t border-blumac-beige space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blumac-copper" />
                  Social Media Captions (English, Hindi, Hinglish)
                </h4>

                {/* English */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-blumac-navy">English (Editorial Instagram):</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.captions.english, "cap-en")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "cap-en" ? "Copied!" : "Copy Caption"}
                    </button>
                  </div>
                  <p className="p-3 bg-blumac-ivory rounded-lg text-xs text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                    {generatedCopy.captions.english}
                  </p>
                </div>

                {/* Hindi */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-blumac-navy">Hindi (हिंदी देवनागरी):</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.captions.hindi, "cap-hi")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "cap-hi" ? "Copied!" : "Copy Caption"}
                    </button>
                  </div>
                  <p className="p-3 bg-blumac-ivory rounded-lg text-xs text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                    {generatedCopy.captions.hindi}
                  </p>
                </div>

                {/* Hinglish */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-blumac-navy">Hinglish (Social Conversational):</span>
                    <button
                      onClick={() => copyToClipboard(generatedCopy.captions.hinglish, "cap-hng")}
                      className="text-[11px] text-blumac-copper hover:underline"
                    >
                      {copiedKey === "cap-hng" ? "Copied!" : "Copy Caption"}
                    </button>
                  </div>
                  <p className="p-3 bg-blumac-ivory rounded-lg text-xs text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                    {generatedCopy.captions.hinglish}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
