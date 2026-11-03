"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Layers,
  FileText,
  Globe,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type {
  ProductScanResult,
  GeneratedMarketingSuite,
} from "@/lib/ai/provider";

// 7 Creative Photography Styles
const CREATIVE_TEMPLATES = [
  {
    id: "luxury-campaign",
    name: "Luxury Korean Campaign",
    badge: "Warm Ivory & Gold Trim",
    description: "Pedestal studio lighting, textured Hanji paper ambience, authentic Seoul seal.",
    bgTheme: "ivory",
  },
  {
    id: "spotlight",
    name: "Premium Product Spotlight",
    badge: "Midnight Dramatic Glow",
    description: "Deep midnight gradient, dramatic central back-light, reflective glossy mirror.",
    bgTheme: "midnight",
  },
  {
    id: "ingredients-botanical",
    name: "Ingredients & Botanical Focus",
    badge: "Active Botanical Focus",
    description: "Soft sage botanical tones, floating active ingredient pills, glass pedestal.",
    bgTheme: "botanical",
  },
  {
    id: "product-launch",
    name: "Product Launch Campaign",
    badge: "Seoul Flagship Aesthetic",
    description: "Modern Seoul aesthetic, bold 'DIRECT FROM SEOUL' banners, dual-tone copper/navy.",
    bgTheme: "launch",
  },
  {
    id: "promotional-sale",
    name: "Promotional Sale Creative",
    badge: "Limited Edition Deals",
    description: "Festive Korean luxury border, calculated discount savings badge, promotional banner.",
    bgTheme: "promo",
  },
  {
    id: "instagram-ad",
    name: "Instagram Editorial Ad",
    badge: "Social Media Ready",
    description: "Minimalist magazine layout, verified BLUMAC checkmark, clean social typography.",
    bgTheme: "social",
  },
  {
    id: "minimal-cleanroom",
    name: "Minimal Cleanroom E-Commerce",
    badge: "Studio White Catalog",
    description: "Pure studio white-to-light-gray gradient, precision drop shadow, razor-sharp hero focus.",
    bgTheme: "cleanroom",
  },
];

// 6 Aspect Ratio Formats
const ASPECT_FORMATS = [
  { id: "sq-1080", name: "Instagram Square", width: 1080, height: 1080, ratio: "1:1", label: "1080 × 1080" },
  { id: "port-1350", name: "Instagram Portrait", width: 1080, height: 1350, ratio: "4:5", label: "1080 × 1350" },
  { id: "story-1920", name: "Instagram Story", width: 1080, height: 1920, ratio: "9:16", label: "1080 × 1920" },
  { id: "fb-1200", name: "Facebook Post", width: 1200, height: 1200, ratio: "1:1", label: "1200 × 1200" },
  { id: "banner-1920", name: "Website Hero Banner", width: 1920, height: 1080, ratio: "16:9", label: "1920 × 1080" },
  { id: "ecom-1500", name: "E-Commerce Product Hero", width: 1500, height: 1500, ratio: "1:1", label: "1500 × 1500" },
];

export function AiStudioClient() {
  // Current Workflow Step: 1 (Capture), 2 (Scan), 3 (Review & Edit), 4 (Creative Studio), 5 (Marketing Copy Hub)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Image Source & Camera
  const [capturedImage, setCapturedImage] = useState<string>(
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
  );
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AI Vision Scanning State
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ProductScanResult | null>(null);
  const [scanJobId, setScanJobId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Review & Edit Product Meta
  const [productName, setProductName] = useState("Relief Sun: Rice + Probiotics");
  const [brand, setBrand] = useState("Beauty of Joseon");
  const [category, setCategory] = useState("Sunscreen");
  const [productType, setProductType] = useState("Daily Chemical Sunscreen");
  const [size, setSize] = useState("50ml / 1.69 fl.oz");
  const [activeIngredients, setActiveIngredients] = useState<string[]>([
    "Rice Extract (30%)",
    "Grain Probiotics Complex",
    "Niacinamide (2%)",
  ]);
  const [visibleBenefits, setVisibleBenefits] = useState<string[]>([
    "SPF50+ PA++++ Broad Spectrum UV Protection",
    "Zero white cast and no greasy residue",
    "Deep barrier nourishment & glass skin finish",
  ]);
  const [usageInstructions, setUsageInstructions] = useState<string[]>([
    "Apply generously 15 minutes before sun exposure as the final step of morning routine.",
    "Reapply every 2 hours during prolonged outdoor activity.",
  ]);
  const [targetSkinType, setTargetSkinType] = useState<string[]>([
    "Dry to Normal Skin",
    "Sensitive Skin",
  ]);
  const [price, setPrice] = useState<string>("1149");
  const [mrp, setMrp] = useState<string>("1400");
  const [newIngredientInput, setNewIngredientInput] = useState<string>("");
  const [newBenefitInput, setNewBenefitInput] = useState<string>("");

  // Creative Studio Customization
  const [selectedTemplate, setSelectedTemplate] = useState<string>("luxury-campaign");
  const [selectedFormat, setSelectedFormat] = useState<string>("sq-1080");
  const [savingAsset, setSavingAsset] = useState<boolean>(false);
  const [assetSavedNotice, setAssetSavedNotice] = useState<string | null>(null);

  // Copy Generation State
  const [generatingCopy, setGeneratingCopy] = useState<boolean>(false);
  const [generatedSuite, setGeneratedSuite] = useState<GeneratedMarketingSuite | null>(null);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [activeCopyTab, setActiveCopyTab] = useState<"overview" | "social" | "seo" | "multilingual">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [catalogPushSuccess, setCatalogPushSuccess] = useState<boolean>(false);

  // --- CAMERA HANDLING ---
  const startCamera = async () => {
    setCameraActive(true);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      setCameraActive(false);
      alert("Unable to access camera. Please verify device permissions or upload a packaging photo.");
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = videoRef.current.videoWidth || 1080;
    offscreen.height = videoRef.current.videoHeight || 1080;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      const dataUrl = offscreen.toDataURL("image/jpeg", 0.95);
      setCapturedImage(dataUrl);
      stopCamera();
      triggerAiScan(dataUrl);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  };

  // --- FILE UPLOAD HANDLING ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      alert("Unsupported file format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum supported size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedImage(reader.result);
        triggerAiScan(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- TRIGGER AI VISION SCAN ---
  const triggerAiScan = async (imageData: string) => {
    setScanning(true);
    setScanError(null);
    setActiveStep(2);

    try {
      const res = await fetch("/api/admin/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageData,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Scanning failed");
      }

      setScanResult(data.scan);
      setScanJobId(data.jobId);
      setIsDevMode(Boolean(data.isMock));

      // Auto-populate form fields from vision extraction
      if (data.scan) {
        const s = data.scan as ProductScanResult;
        if (s.product_name) setProductName(s.product_name);
        if (s.brand) setBrand(s.brand);
        if (s.category) setCategory(s.category);
        if (s.product_type) setProductType(s.product_type);
        if (s.size) setSize(s.size);
        if (Array.isArray(s.active_ingredients) && s.active_ingredients.length > 0) {
          setActiveIngredients(s.active_ingredients);
        }
        if (Array.isArray(s.visible_benefits) && s.visible_benefits.length > 0) {
          setVisibleBenefits(s.visible_benefits);
        }
        if (Array.isArray(s.usage_instructions) && s.usage_instructions.length > 0) {
          setUsageInstructions(s.usage_instructions);
        }
        if (Array.isArray(s.target_skin_or_hair_type) && s.target_skin_or_hair_type.length > 0) {
          setTargetSkinType(s.target_skin_or_hair_type);
        }
      }

      // Automatically advance to Step 3 if clear
      if (!data.scan.is_unclear) {
        setActiveStep(3);
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to scan product packaging.");
    } finally {
      setScanning(false);
    }
  };

  // --- RESET TO SCANNED VALUES ---
  const resetToScannedValues = () => {
    if (!scanResult) return;
    if (scanResult.product_name) setProductName(scanResult.product_name);
    if (scanResult.brand) setBrand(scanResult.brand);
    if (scanResult.category) setCategory(scanResult.category);
    if (scanResult.product_type) setProductType(scanResult.product_type);
    if (scanResult.size) setSize(scanResult.size);
    if (scanResult.active_ingredients) setActiveIngredients([...scanResult.active_ingredients]);
    if (scanResult.visible_benefits) setVisibleBenefits([...scanResult.visible_benefits]);
    if (scanResult.usage_instructions) setUsageInstructions([...scanResult.usage_instructions]);
    if (scanResult.target_skin_or_hair_type) setTargetSkinType([...scanResult.target_skin_or_hair_type]);
  };

  // --- HIGH-RESOLUTION CANVAS RENDERING ENGINE ---
  const renderCreativeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const format = ASPECT_FORMATS.find((f) => f.id === selectedFormat) || ASPECT_FORMATS[0];
    const width = format.width;
    const height = format.height;
    canvas.width = width;
    canvas.height = height;

    const currentPrice = parseFloat(price) || 1149;
    const originalMrp = parseFloat(mrp) || 1400;
    const discountPct = originalMrp > currentPrice ? Math.round(((originalMrp - currentPrice) / originalMrp) * 100) : 0;
    const isBanner = format.id === "banner-1920";

    // 1. BACKGROUND RENDERING BASED ON THEME
    switch (selectedTemplate) {
      case "spotlight": {
        // Dramatic Midnight Studio Radial Gradient
        const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 80, width * 0.5, height * 0.5, width * 0.85);
        grad.addColorStop(0, "#162D50");
        grad.addColorStop(0.5, "#0B192C");
        grad.addColorStop(1, "#030811");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Luminous Studio Backdrop Particles / Subtle Light Dots
        ctx.fillStyle = "rgba(199, 123, 100, 0.15)";
        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.25, 140, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.35, 110, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "ingredients-botanical": {
        // Soft Botanical Sage & Fresh Rice Water Tone
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#F2F7F4");
        grad.addColorStop(0.5, "#E6F0EA");
        grad.addColorStop(1, "#D4E5DC");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "product-launch": {
        // Modern Seoul Dual Tone High-Contrast
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#0B192C");
        grad.addColorStop(0.65, "#142B50");
        grad.addColorStop(1, "#F8F5EF");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "promotional-sale": {
        // Festive Luxury Burgundy / Deep Copper Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#2B1115");
        grad.addColorStop(0.5, "#421C22");
        grad.addColorStop(1, "#18090C");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "minimal-cleanroom": {
        // Pure Laboratory White / Gray Gradient
        const grad = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.5, width * 0.75);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.6, "#F8FAFC");
        grad.addColorStop(1, "#E2E8F0");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case "instagram-ad": {
        // Editorial Warm Stone / Sand
        ctx.fillStyle = "#EFECE6";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#FFFFFF";
        const margin = width * 0.04;
        ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);
        break;
      }
      case "luxury-campaign":
      default: {
        // Luxury Korean Hanji & Warm Ivory
        const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 100, width * 0.5, height * 0.5, width * 0.9);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.5, "#F8F5EF");
        grad.addColorStop(1, "#EDE6D9");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Luxury Double Border Inset
        ctx.strokeStyle = "#C77B64";
        ctx.lineWidth = Math.max(3, width * 0.0035);
        ctx.strokeRect(width * 0.035, height * 0.035, width * 0.93, height * 0.93);

        ctx.strokeStyle = "rgba(11, 25, 44, 0.4)";
        ctx.lineWidth = Math.max(1, width * 0.001);
        ctx.strokeRect(width * 0.042, height * 0.042, width * 0.916, height * 0.916);
        break;
      }
    }

    // 2. LOAD & RENDER ORIGINAL HERO PRODUCT OBJECT
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = capturedImage;

    img.onload = () => {
      // Calculate hero product positioning based on aspect ratio
      let heroX: number;
      let heroY: number;
      let heroMaxW: number;
      let heroMaxH: number;

      if (isBanner) {
        // Website Banner (1920x1080): Hero product positioned on right side
        heroX = width * 0.72;
        heroY = height * 0.52;
        heroMaxW = width * 0.38;
        heroMaxH = height * 0.72;
      } else {
        // Square, Portrait, Story, E-Commerce: Hero product centered
        heroX = width * 0.5;
        heroY = height * 0.46;
        heroMaxW = width * 0.58;
        heroMaxH = height * 0.48;
      }

      // Preserve native aspect ratio of uploaded packaging
      const imgAspect = img.naturalWidth / (img.naturalHeight || 1);
      let renderW = heroMaxW;
      let renderH = heroMaxW / imgAspect;

      if (renderH > heroMaxH) {
        renderH = heroMaxH;
        renderW = heroMaxH * imgAspect;
      }

      // 3. DRAW CONTACT SHADOW & PEDESTAL UNDERNEATH PRODUCT
      const pedestalY = heroY + renderH * 0.46;
      const pedestalRadiusX = renderW * 0.65;
      const pedestalRadiusY = renderW * 0.18;

      ctx.save();
      // Contact drop shadow (multi-layered soft blur)
      const shadowGrad = ctx.createRadialGradient(
        heroX,
        pedestalY,
        pedestalRadiusX * 0.1,
        heroX,
        pedestalY,
        pedestalRadiusX * 1.3
      );
      shadowGrad.addColorStop(0, "rgba(5, 12, 22, 0.45)");
      shadowGrad.addColorStop(0.4, "rgba(5, 12, 22, 0.2)");
      shadowGrad.addColorStop(1, "rgba(5, 12, 22, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(heroX, pedestalY, pedestalRadiusX * 1.25, pedestalRadiusY * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal Plate (for Luxury, Botanical, or Spotlight styles)
      if (selectedTemplate === "luxury-campaign" || selectedTemplate === "ingredients-botanical" || selectedTemplate === "spotlight") {
        ctx.fillStyle = selectedTemplate === "spotlight" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.85)";
        ctx.strokeStyle = selectedTemplate === "spotlight" ? "rgba(255, 255, 255, 0.2)" : "#E2DCD3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(heroX, pedestalY, pedestalRadiusX, pedestalRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // 4. DRAW ORIGINAL HERO PRODUCT IMAGE
      // We clip in rounded card if desired, or render high-fidelity crisp original packaging
      ctx.save();
      // Add subtle studio edge illumination around bottle
      ctx.shadowColor = selectedTemplate === "spotlight" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, heroX - renderW / 2, heroY - renderH / 2, renderW, renderH);
      ctx.restore();

      // 5. RENDER COMMERCIAL BRANDING & EDITORIAL TYPOGRAPHY
      const isDarkTheme = selectedTemplate === "spotlight" || selectedTemplate === "promotional-sale";
      const titleColor = isDarkTheme ? "#FFFFFF" : "#0B192C";
      const subColor = isDarkTheme ? "#E2E8F0" : "#5A6578";
      const accentColor = "#C77B64";

      if (isBanner) {
        // --- WEBSITE HERO BANNER (1920 x 1080) LAYOUT ---
        const leftX = width * 0.08;

        // Top Brand Bar
        ctx.fillStyle = accentColor;
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.letterSpacing = "6px";
        ctx.fillText("BLUMAC KOREAN STORE • SEOUL TO INDIA", leftX, height * 0.18);

        // Sub Brand Name
        ctx.fillStyle = subColor;
        ctx.font = "bold 28px system-ui, sans-serif";
        ctx.letterSpacing = "3px";
        ctx.fillText((brand || "KOREAN BEAUTY").toUpperCase(), leftX, height * 0.26);

        // Product Name (Editorial Serif)
        ctx.fillStyle = titleColor;
        ctx.font = "bold 56px 'Playfair Display', Georgia, serif";
        ctx.letterSpacing = "1px";
        ctx.fillText(productName.length > 30 ? productName.substring(0, 30) + "..." : productName, leftX, height * 0.35);

        // Product Type / Size Tag
        ctx.fillStyle = accentColor;
        ctx.font = "bold 24px system-ui, sans-serif";
        ctx.fillText(`${productType || category} • ${size || "Authentic Seoul Batch"}`, leftX, height * 0.42);

        // Top 2 Active Benefits
        ctx.fillStyle = subColor;
        ctx.font = "20px system-ui, sans-serif";
        const benefit1 = visibleBenefits[0] || "100% Direct South Korean Import";
        const benefit2 = visibleBenefits[1] || "Clinical Glass Skin Barrier Hydration";
        ctx.fillText(`✓  ${benefit1}`, leftX, height * 0.50);
        ctx.fillText(`✓  ${benefit2}`, leftX, height * 0.55);

        // Active Ingredients Pills
        if (activeIngredients.length > 0) {
          ctx.fillStyle = isDarkTheme ? "rgba(255,255,255,0.12)" : "#EDE6D9";
          ctx.beginPath();
          ctx.roundRect(leftX, height * 0.62, 580, 48, 24);
          ctx.fill();

          ctx.fillStyle = isDarkTheme ? "#FFFFFF" : "#0B192C";
          ctx.font = "bold 18px system-ui, sans-serif";
          ctx.fillText(`KEY ACTIVES: ${activeIngredients.slice(0, 2).join(" • ")}`, leftX + 24, height * 0.655);
        }

        // Pricing Box & CTA
        ctx.fillStyle = "#0B192C";
        ctx.beginPath();
        ctx.roundRect(leftX, height * 0.74, 420, 84, 16);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillText(`BUY: ${formatCurrency(currentPrice)}`, leftX + 32, height * 0.795);

        if (discountPct > 0) {
          ctx.fillStyle = "#94A3B8";
          ctx.font = "20px system-ui, sans-serif";
          ctx.fillText(`MRP: ${formatCurrency(originalMrp)}`, leftX + 220, height * 0.795);

          ctx.fillStyle = "#DE9984";
          ctx.font = "bold 16px system-ui, sans-serif";
          ctx.fillText(`(${discountPct}% OFF)`, leftX + 340, height * 0.795);
        }
      } else {
        // --- SQUARE / PORTRAIT / STORY / E-COMMERCE LAYOUTS ---
        const midX = width * 0.5;

        // Top Brand Header Banner
        ctx.fillStyle = isDarkTheme ? "rgba(255, 255, 255, 0.08)" : "#0B192C";
        const topH = Math.max(70, height * 0.085);
        ctx.fillRect(0, 0, width, topH);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${Math.round(width * 0.028)}px 'Playfair Display', Georgia, serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = "4px";
        ctx.fillText("BLUMAC KOREAN STORE", midX, topH * 0.52);

        ctx.fillStyle = "#C77B64";
        ctx.font = `bold ${Math.round(width * 0.013)}px system-ui, sans-serif`;
        ctx.letterSpacing = "5px";
        ctx.fillText("100% GENUINE IMPORT • DIRECT FROM SEOUL", midX, topH * 0.82);

        // Header Campaign Ribbon over product
        const ribbonY = topH + height * 0.035;
        ctx.fillStyle = isDarkTheme ? "#C77B64" : "#0B192C";
        const ribbonW = width * 0.55;
        const ribbonH = Math.max(34, height * 0.038);
        ctx.beginPath();
        ctx.roundRect(midX - ribbonW / 2, ribbonY, ribbonW, ribbonH, ribbonH / 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${Math.round(width * 0.017)}px system-ui, sans-serif`;
        ctx.letterSpacing = "2px";
        ctx.textAlign = "center";
        const ribbonText =
          selectedTemplate === "promotional-sale"
            ? `🔥 LIMITED OFFER: SAVE ${discountPct || 15}% OFF`
            : selectedTemplate === "product-launch"
            ? "✨ NEW ARRIVAL: FRESH SEOUL BATCH"
            : selectedTemplate === "ingredients-botanical"
            ? "🌿 ACTIVE BOTANICAL FORMULATION"
            : "✨ VERIFIED AUTHENTIC K-BEAUTY";
        ctx.fillText(ribbonText, midX, ribbonY + ribbonH * 0.65);

        // Bottom Typography Section
        const bottomBaseY = height * 0.74;

        // Brand Subhead
        ctx.fillStyle = accentColor;
        ctx.font = `bold ${Math.round(width * 0.022)}px system-ui, sans-serif`;
        ctx.letterSpacing = "3px";
        ctx.textAlign = "center";
        ctx.fillText((brand || "KOREAN SKINCARE").toUpperCase(), midX, bottomBaseY);

        // Product Name
        ctx.fillStyle = titleColor;
        ctx.font = `bold ${Math.round(width * 0.032)}px 'Playfair Display', Georgia, serif`;
        ctx.letterSpacing = "0.5px";
        const displayTitle = productName.length > 34 ? productName.substring(0, 34) + "..." : productName;
        ctx.fillText(displayTitle, midX, bottomBaseY + height * 0.04);

        // Active Ingredient Snippet
        ctx.fillStyle = subColor;
        ctx.font = `italic ${Math.round(width * 0.018)}px system-ui, sans-serif`;
        const ingSnippet = activeIngredients.slice(0, 2).join(" • ") || "Pure Korean Glass Skin Formulation";
        ctx.fillText(`Key Actives: ${ingSnippet}`, midX, bottomBaseY + height * 0.075);

        // Bottom Pricing Bar
        const priceBoxW = width * 0.65;
        const priceBoxH = Math.max(54, height * 0.065);
        const priceBoxY = bottomBaseY + height * 0.10;

        ctx.fillStyle = isDarkTheme ? "rgba(255, 255, 255, 0.12)" : "#0B192C";
        ctx.beginPath();
        ctx.roundRect(midX - priceBoxW / 2, priceBoxY, priceBoxW, priceBoxH, 14);
        ctx.fill();

        ctx.fillStyle = "#DE9984";
        ctx.font = `bold ${Math.round(width * 0.028)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          `SPECIAL: ${formatCurrency(currentPrice)}`,
          discountPct > 0 ? midX - priceBoxW * 0.18 : midX,
          priceBoxY + priceBoxH * 0.62
        );

        if (discountPct > 0) {
          ctx.fillStyle = "#94A3B8";
          ctx.font = `${Math.round(width * 0.018)}px system-ui, sans-serif`;
          ctx.fillText(
            `MRP: ${formatCurrency(originalMrp)}`,
            midX + priceBoxW * 0.18,
            priceBoxY + priceBoxH * 0.62
          );
        }
      }
    };
  }, [
    capturedImage,
    selectedTemplate,
    selectedFormat,
    productName,
    brand,
    category,
    productType,
    size,
    price,
    mrp,
    activeIngredients,
    visibleBenefits,
  ]);

  useEffect(() => {
    renderCreativeCanvas();
  }, [renderCreativeCanvas]);

  // --- DOWNLOAD HIGH RES CANVAS ---
  const downloadCreativeImage = (formatType: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = formatType === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    const cleanBrand = (brand || "k-beauty").toLowerCase().replace(/\s+/g, "-");
    const cleanTemplate = selectedTemplate.toLowerCase().replace(/\s+/g, "-");
    a.download = `blumac-studio-${cleanBrand}-${cleanTemplate}-${selectedFormat}.${formatType}`;
    a.click();
  };

  // --- SAVE ASSET TO DB ---
  const saveAssetToDb = async () => {
    setSavingAsset(true);
    setAssetSavedNotice(null);
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas ? canvas.toDataURL("image/jpeg", 0.8) : null;
      const res = await fetch("/api/admin/ai/asset/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: scanJobId,
          assetType: "IMAGE",
          templateName: `${selectedTemplate} (${selectedFormat})`,
          url: dataUrl ? dataUrl.substring(0, 200) + "..." : null,
          approved: true,
        }),
      });
      if (res.ok) {
        setAssetSavedNotice("Asset saved to BLUMAC Asset Library successfully!");
        setTimeout(() => setAssetSavedNotice(null), 4000);
      }
    } catch {
      // ignore
    } finally {
      setSavingAsset(false);
    }
  };

  // --- GENERATE AI MARKETING COPY SUITE ---
  const handleGenerateCopySuite = async () => {
    setGeneratingCopy(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          brand,
          category,
          productType,
          size,
          activeIngredients,
          visibleBenefits,
          usageInstructions,
          targetSkinType,
          price: parseFloat(price) || 1199,
          mrp: parseFloat(mrp) || 1499,
          templateType: selectedTemplate,
        }),
      });

      const data = await res.json();
      if (data.copy) {
        setGeneratedSuite(data.copy);
        setIsDevMode(Boolean(data.isMock));
        setActiveStep(5);
      }
    } catch {
      alert("Failed to generate AI marketing content. Please try again.");
    } finally {
      setGeneratingCopy(false);
    }
  };

  // --- CLIPBOARD COPY HELPER ---
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // --- PUSH TO CATALOG SIMULATION / EXPORT ---
  const handlePushToCatalog = () => {
    const catalogProductDraft = {
      name: productName,
      brand,
      category,
      type: productType,
      size,
      price: parseFloat(price) || 1149,
      mrp: parseFloat(mrp) || 1400,
      description: generatedSuite?.detailedDescription || "",
      features: generatedSuite?.keyFeatures || [],
      benefits: visibleBenefits,
      ingredients: activeIngredients,
      heroImage: capturedImage,
      exportedAt: new Date().toISOString(),
    };

    localStorage.setItem("blumac_draft_product", JSON.stringify(catalogProductDraft));
    setCatalogPushSuccess(true);
    setTimeout(() => setCatalogPushSuccess(false), 5000);
  };

  // Tag helper functions
  const addIngredient = () => {
    if (!newIngredientInput.trim()) return;
    setActiveIngredients([...activeIngredients, newIngredientInput.trim()]);
    setNewIngredientInput("");
  };

  const removeIngredient = (idx: number) => {
    setActiveIngredients(activeIngredients.filter((_, i) => i !== idx));
  };

  const addBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setVisibleBenefits([...visibleBenefits, newBenefitInput.trim()]);
    setNewBenefitInput("");
  };

  const removeBenefit = (idx: number) => {
    setVisibleBenefits(visibleBenefits.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blumac-beige pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
            <Sparkles className="w-4 h-4 text-blumac-copper" />
            <span>BLUMAC K-Beauty AI Studio • Computer Vision & Creative Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            AI Product Scanner & Creative Studio
          </h1>
          <p className="text-xs text-blumac-slate mt-1 max-w-2xl">
            Upload skincare packaging, extract verified ingredients and benefits via Gemini Vision, customize high-resolution studio creatives preserving the real product hero, and generate multilingual marketing copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blumac-ivory border border-blumac-beige px-3.5 py-1.5 rounded-full text-xs font-semibold text-blumac-navy shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span>Gemini Vision Engine: Ready</span>
          </div>
        </div>
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-blumac-beige shadow-subtle">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-bold">
          {[
            { num: 1, label: "1. Capture / Upload" },
            { num: 2, label: "2. Gemini Scan" },
            { num: 3, label: "3. Review & Edit" },
            { num: 4, label: "4. Creative Studio" },
            { num: 5, label: "5. Marketing Copy" },
          ].map((step) => (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeStep === step.num
                  ? "bg-blumac-navy text-white shadow-sm"
                  : activeStep > step.num
                  ? "bg-blumac-ivory text-blumac-navy hover:bg-blumac-beige border border-blumac-beige"
                  : "bg-gray-50 text-gray-400 hover:text-gray-600"
              }`}
            >
              {activeStep > step.num ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                  {step.num}
                </span>
              )}
              <span>{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 cols): Capture, Camera, and High-Res Canvas */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Capture & Camera Control Panel */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
                <Camera className="w-4 h-4 text-blumac-copper" />
                1. Capture or Upload Skincare Packaging
              </h2>
              {scanning && (
                <span className="flex items-center gap-1.5 text-xs text-blumac-copper font-semibold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing packaging...
                </span>
              )}
            </div>

            {cameraActive ? (
              <div className="space-y-3">
                <div className="relative aspect-square sm:aspect-video bg-black rounded-xl overflow-hidden border-2 border-blumac-copper">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg m-8 pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/80 bg-black/50 px-2 py-1 rounded">
                      Align product packaging front label here
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={takeSnapshot}
                    disabled={!cameraReady}
                    className="flex-1 py-3 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    Snap & Scan Packaging
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera Viewfinder</span>
                  </button>

                  <label className="flex-1 py-3.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-center shadow-xs">
                    <Upload className="w-4 h-4 text-blumac-copper" />
                    <span>Upload Packaging Image</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Thumbnail & Manual Re-Scan Button */}
                <div className="flex items-center justify-between p-3 bg-blumac-ivory rounded-xl border border-blumac-beige">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-blumac-beige bg-white shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={capturedImage} alt="Uploaded packaging" className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blumac-navy">Active Packaging Hero Reference</p>
                      <p className="text-[11px] text-blumac-slate">Original uploaded product identity preserved</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerAiScan(capturedImage)}
                    disabled={scanning}
                    className="px-3 py-1.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
                    <span>Re-Scan Vision</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scan Error or Warning Alert */}
            {scanError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Image Scan Alert</p>
                  <p>{scanError}</p>
                </div>
              </div>
            )}

            {scanResult?.is_unclear && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-bold">Unclear Packaging Image Detected</p>
                  <p>{scanResult.unclear_reason || "The packaging text or brand could not be clearly verified. Please snap a clearer, front-lit photo."}</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Creative Customization Controls: 7 Styles & 6 Aspect Ratios */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-blumac-copper" />
                4. Branded Creative Photography Style (7 Styles)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CREATIVE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 rounded-xl text-left border transition-all text-xs ${
                      selectedTemplate === tmpl.id
                        ? "border-blumac-copper bg-blumac-copper/10 font-bold text-blumac-navy shadow-sm ring-1 ring-blumac-copper"
                        : "border-blumac-beige bg-blumac-ivory text-blumac-slate hover:border-blumac-copper"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blumac-navy">{tmpl.name}</span>
                      <span className="text-[10px] text-blumac-copper font-medium">{tmpl.badge}</span>
                    </div>
                    <p className="text-[11px] text-blumac-slate mt-1 line-clamp-1">{tmpl.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blumac-navy mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blumac-copper" />
                Aspect Ratio & Marketing Format (6 Formats)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASPECT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      selectedFormat === fmt.id
                        ? "border-blumac-navy bg-blumac-navy text-white font-bold shadow-sm"
                        : "border-blumac-beige bg-blumac-ivory text-blumac-slate hover:border-blumac-navy"
                    }`}
                  >
                    <span className="block truncate">{fmt.name}</span>
                    <span className={`text-[10px] block mt-0.5 ${selectedFormat === fmt.id ? "text-blumac-copperLight" : "text-blumac-slate"}`}>
                      {fmt.label} ({fmt.ratio})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Live High-Resolution Canvas Preview & Download Hub */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blumac-beige">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blumac-copper" />
                  Live High-Resolution Studio Canvas
                </h3>
                <p className="text-[11px] text-blumac-slate">Original uploaded packaging rendered as central hero</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCreativeImage("png")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={() => downloadCreativeImage("jpeg")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blumac-copper hover:bg-blumac-copperLight text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JPEG</span>
                </button>

                <button
                  onClick={saveAssetToDb}
                  disabled={savingAsset}
                  title="Save Asset to BLUMAC Database"
                  className="p-1.5 bg-blumac-ivory border border-blumac-beige text-blumac-navy hover:bg-blumac-beige rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-blumac-copper" />
                </button>
              </div>
            </div>

            {assetSavedNotice && (
              <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>{assetSavedNotice}</span>
              </div>
            )}

            {/* Canvas Container with Max Constraints */}
            <div className="relative w-full rounded-xl overflow-hidden border border-blumac-beige shadow-inner bg-blumac-ivory flex items-center justify-center p-3">
              <canvas
                ref={canvasRef}
                className="max-h-[520px] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): AI Vision Extraction Review & Marketing Copy Generator */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 3: Verified Product Information Review Form */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blumac-copper" />
                  3. Admin Review & Product Specifications
                </h2>
                <p className="text-[11px] text-blumac-slate mt-0.5">
                  AI detected fields auto-populated below. Admin can override or refine details.
                </p>
              </div>

              {scanResult && (
                <button
                  onClick={resetToScannedValues}
                  className="px-2.5 py-1 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-blumac-copper" />
                  <span>Reset to Scanned</span>
                </button>
              )}
            </div>

            {/* AI Vision Metadata Quick Card (Confidence, Bottle Type, Detected Colors) */}
            {scanResult && (
              <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blumac-navy flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    Vision OCR Confidence: {(scanResult.confidence_score * 100).toFixed(0)}%
                  </span>
                  {scanResult.size && (
                    <span className="text-blumac-copper font-semibold">Detected Vol: {scanResult.size}</span>
                  )}
                </div>
                {scanResult.packaging_description && (
                  <p className="text-blumac-slate italic">
                    Packaging: &quot;{scanResult.packaging_description}&quot;
                  </p>
                )}
                {scanResult.packaging_colors?.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-blumac-slate">Detected Palette:</span>
                    <div className="flex gap-1">
                      {scanResult.packaging_colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-xs inline-block"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields: Editable with Scanned Value Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper font-medium"
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
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Sunscreen, Serum, Essence..."
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Product Type
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Hydrating Gel, Daily Shield..."
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Size (ml / g)
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="50ml, 100ml..."
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>
            </div>

            {/* Active Ingredients Tag Manager */}
            <div>
              <label className="block font-semibold text-blumac-navy mb-1.5">
                Active Ingredients (Scanned & Verified)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {activeIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blumac-ivory border border-blumac-beige text-blumac-navy rounded-full text-xs font-semibold"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredientInput}
                  onChange={(e) => setNewIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                  placeholder="Add ingredient (e.g. Snail Mucin, Niacinamide)..."
                  className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-xs text-blumac-navy"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visible Benefits Tag Manager */}
            <div>
              <label className="block font-semibold text-blumac-navy mb-1.5">
                Verified Product Benefits
              </label>
              <div className="space-y-1 mb-2">
                {visibleBenefits.map((ben, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-blumac-ivory border border-blumac-beige rounded-lg text-xs text-blumac-navy"
                  >
                    <span>• {ben}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="hover:text-red-500 text-blumac-slate"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  placeholder="Add benefit (e.g. Non-greasy finish)..."
                  className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-xs text-blumac-navy"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pricing Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-blumac-navy mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
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

            {/* Trigger AI Marketing Content Suite */}
            <button
              onClick={handleGenerateCopySuite}
              disabled={generatingCopy}
              className="w-full py-4 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blumac-copperLight" />
              <span>{generatingCopy ? "Generating Full Marketing Suite..." : "Generate AI Marketing Copy Suite"}</span>
            </button>
          </div>

          {/* Step 5: Marketing Content Generation Suite (Tabs & Multilingual) */}
          {generatedSuite && (
            <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blumac-beige">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blumac-copper" />
                    5. AI Marketing Content Hub
                  </h3>
                  {isDevMode && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                      ⚡ Local Development Mode (Deterministic K-Beauty Engine)
                    </span>
                  )}
                </div>

                <button
                  onClick={handlePushToCatalog}
                  className="px-3.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send to Product Catalog</span>
                </button>
              </div>

              {catalogPushSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>
                    Product draft & verified specifications saved to browser store! Ready for immediate catalog publication.
                  </span>
                </div>
              )}

              {/* Sub-Tabs for Copy Navigation */}
              <div className="flex border-b border-blumac-beige text-xs">
                {[
                  { id: "overview", label: "Descriptions" },
                  { id: "social", label: "Social Captions" },
                  { id: "seo", label: "SEO Meta" },
                  { id: "multilingual", label: "Hindi / Hinglish" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCopyTab(tab.id as any)}
                    className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                      activeCopyTab === tab.id
                        ? "border-blumac-copper text-blumac-navy font-bold"
                        : "border-transparent text-blumac-slate hover:text-blumac-navy"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Product Title & Descriptions */}
              {activeCopyTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Product Title:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.title, "title")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "title" ? "Copied!" : "Copy Title"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-navy font-semibold border border-blumac-beige">
                      {generatedSuite.title}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Short Hook Description:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.shortDescription, "short")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "short" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-charcoal border border-blumac-beige leading-relaxed">
                      {generatedSuite.shortDescription}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Detailed Editorial Story:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.detailedDescription, "detailed")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "detailed" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="p-3 bg-blumac-ivory rounded-lg text-blumac-charcoal border border-blumac-beige leading-relaxed whitespace-pre-line">
                      {generatedSuite.detailedDescription}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">How To Use (Routine Steps):</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.howToUse, "usage")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "usage" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-slate border border-blumac-beige leading-relaxed">
                      {generatedSuite.howToUse}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Social Media Captions & Hashtags */}
              {activeCopyTab === "social" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Instagram Post Caption:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.instagramCaption, "ig-cap")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "ig-cap" ? "Copied!" : "Copy Instagram Caption"}
                      </button>
                    </div>
                    <p className="p-3 bg-blumac-ivory rounded-lg text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                      {generatedSuite.instagramCaption}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Facebook Page Post:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.facebookCaption, "fb-cap")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "fb-cap" ? "Copied!" : "Copy Facebook Caption"}
                      </button>
                    </div>
                    <p className="p-3 bg-blumac-ivory rounded-lg text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                      {generatedSuite.facebookCaption}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Curated K-Beauty Hashtags:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.hashtags.join(" "), "tags")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "tags" ? "Copied!" : "Copy All Hashtags"}
                      </button>
                    </div>
                    <div className="p-2.5 bg-blumac-ivory rounded-lg border border-blumac-beige flex flex-wrap gap-1">
                      {generatedSuite.hashtags.map((h, i) => (
                        <span key={i} className="text-blumac-copper font-medium">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: SEO Meta Tags */}
              {activeCopyTab === "seo" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">SEO Meta Title (Under 60 chars):</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.seoTitle, "seo-title")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "seo-title" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-navy font-semibold border border-blumac-beige">
                      {generatedSuite.seoTitle}
                    </p>
                    <span className="text-[10px] text-blumac-slate mt-0.5 block">
                      Character count: {generatedSuite.seoTitle.length}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">SEO Meta Description (Under 155 chars):</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.seoMetaDescription, "seo-desc")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "seo-desc" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-slate border border-blumac-beige font-mono text-[11px] leading-relaxed">
                      {generatedSuite.seoMetaDescription}
                    </p>
                    <span className="text-[10px] text-blumac-slate mt-0.5 block">
                      Character count: {generatedSuite.seoMetaDescription.length}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">High-Converting Ad Headline:</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.promotionalHeadline, "promo-head")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "promo-head" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="p-2.5 bg-blumac-ivory rounded-lg text-blumac-copper font-bold border border-blumac-beige">
                      {generatedSuite.promotionalHeadline}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Hindi & Hinglish Copy */}
              {activeCopyTab === "multilingual" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Hindi (हिंदी देवनागरी इंस्टाग्राम कैप्शन):</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.translations.hindi.instagramCaption, "hi-cap")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "hi-cap" ? "Copied!" : "Copy Hindi"}
                      </button>
                    </div>
                    <p className="p-3 bg-blumac-ivory rounded-lg text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                      {generatedSuite.translations.hindi.instagramCaption}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blumac-navy">Hinglish (Social Conversational Hook):</span>
                      <button
                        onClick={() => copyToClipboard(generatedSuite.translations.hinglish.instagramCaption, "hng-cap")}
                        className="text-[11px] text-blumac-copper hover:underline font-semibold"
                      >
                        {copiedKey === "hng-cap" ? "Copied!" : "Copy Hinglish"}
                      </button>
                    </div>
                    <p className="p-3 bg-blumac-ivory rounded-lg text-blumac-charcoal whitespace-pre-line border border-blumac-beige">
                      {generatedSuite.translations.hinglish.instagramCaption}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
