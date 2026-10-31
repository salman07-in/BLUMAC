"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Package,
  Layers,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  brands: any[];
  onImportSuccess: (importedProducts: any[]) => void;
}

interface ParsedProduct {
  name: string;
  price: number;
  mrp: number;
  description: string;
  shortDescription?: string;
  category?: string;
  brand?: string;
  images: string[];
  stock: number;
  sku?: string;
}

export function ProductBulkImportModal({
  isOpen,
  onClose,
  categories,
  brands,
  onImportSuccess,
}: ProductBulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "WHATSAPP_SCRIPT" | "META_GUIDE">("UPLOAD");
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [fileName, setFileName] = useState("");
  const [defaultCategoryId, setDefaultCategoryId] = useState(categories[0]?.id || "");
  const [defaultBrandId, setDefaultBrandId] = useState(brands[0]?.id || "");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // The 1-click WhatsApp Web Extractor script
  const waExtractorCode = `(() => {
  const items = [];
  const cards = document.querySelectorAll('div[role="listitem"], div[role="row"], div[role="button"], div[tabindex="0"]');
  cards.forEach((el) => {
    const text = el.innerText || '';
    if (!text) return;
    const lines = text.split('\\n').map(l => l.trim()).filter(Boolean);
    const priceLine = lines.find(l => /(?:₹|Rs\\.?|INR|\\$)\\s*[0-9,]+/i.test(l));
    if (priceLine) {
      const name = lines[0];
      const img = el.querySelector('img')?.src || '';
      const priceMatch = priceLine.match(/[0-9,.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
      if (name && price > 0 && !items.some(i => i.name === name)) {
        items.push({
          name: name,
          price: price,
          mrp: Math.round(price * 1.15),
          description: lines.slice(1).filter(l => l !== priceLine).join(' ') || (name + ' authentic product'),
          images: img ? [img] : [],
          stock: 30
        });
      }
    }
  });
  if (items.length === 0) {
    alert("WhatsApp Web me apna Catalog open karke scroll karein taaki products dikhein, fir dobara run karein.");
    return;
  }
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "whatsapp_catalog_products.json";
  a.click();
  alert("Safaltapoorvak " + items.length + " products download ho gaye! Ab ise BLUMAC Admin me upload karein.");
})();`;

  // Parse CSV Line Helper (handles quotes and commas)
  const parseCSVLine = (text: string): string[] => {
    const p: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        p.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    p.push(cur.trim());
    return p;
  };

  // Handle File Upload (CSV or JSON)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        if (file.name.endsWith(".json")) {
          // JSON Parse
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : parsed.products || parsed.items || [];
          normalizeProducts(list);
        } else {
          // CSV Parse
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setErrorMessage("CSV file must have a header row and at least 1 product row.");
            return;
          }

          const rawHeaders = parseCSVLine(lines[0]).map((h) =>
            h.toLowerCase().replace(/[^a-z0-9]/g, "_")
          );

          // Find column index mappings
          const getColIdx = (...candidates: string[]) => {
            return rawHeaders.findIndex((h) =>
              candidates.some((c) => h.includes(c))
            );
          };

          const nameIdx = getColIdx("title", "name", "product_name", "item_name");
          const priceIdx = getColIdx("price", "sale_price", "selling_price", "amount");
          const mrpIdx = getColIdx("mrp", "regular_price", "compare_at_price", "original_price");
          const descIdx = getColIdx("description", "body_html", "desc", "details");
          const imgIdx = getColIdx("image_link", "images", "image_url", "image", "photo");
          const catIdx = getColIdx("category", "product_category", "product_type", "collection");
          const brandIdx = getColIdx("brand", "vendor", "manufacturer");
          const stockIdx = getColIdx("stock", "quantity", "inventory");
          const skuIdx = getColIdx("sku", "item_group_id", "product_code");

          if (nameIdx === -1) {
            setErrorMessage("Could not find a 'Name' or 'Title' column in your CSV.");
            return;
          }

          const results: any[] = [];
          for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (!row || row.length <= nameIdx || !row[nameIdx]) continue;

            const name = row[nameIdx];
            const rawPrice = priceIdx !== -1 ? row[priceIdx] : "0";
            const rawMrp = mrpIdx !== -1 ? row[mrpIdx] : "";
            const desc = descIdx !== -1 ? row[descIdx] : "";
            const rawImg = imgIdx !== -1 ? row[imgIdx] : "";
            const cat = catIdx !== -1 ? row[catIdx] : "";
            const brand = brandIdx !== -1 ? row[brandIdx] : "";
            const stock = stockIdx !== -1 ? row[stockIdx] : "30";
            const sku = skuIdx !== -1 ? row[skuIdx] : "";

            results.push({
              name,
              price: rawPrice,
              mrp: rawMrp,
              description: desc,
              images: rawImg ? [rawImg] : [],
              category: cat,
              brand: brand,
              stock: stock,
              sku: sku,
            });
          }

          normalizeProducts(results);
        }
      } catch (err: any) {
        setErrorMessage("File parse error: " + (err.message || "Invalid file format."));
      }
    };

    reader.readAsText(file);
  };

  const normalizeProducts = (rawList: any[]) => {
    const cleanList: ParsedProduct[] = rawList
      .filter((item) => item && (item.name || item.title))
      .map((item) => {
        const name = (item.name || item.title || "").trim();
        const price =
          typeof item.price === "number"
            ? item.price
            : parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || 0;
        let mrp =
          typeof item.mrp === "number"
            ? item.mrp
            : parseFloat(String(item.mrp || "").replace(/[^0-9.]/g, "")) || 0;

        if (mrp <= 0 || mrp < price) {
          mrp = Math.round(price * 1.15) || price;
        }

        let images: string[] = [];
        if (Array.isArray(item.images)) {
          images = item.images.filter(Boolean);
        } else if (typeof item.images === "string" && item.images) {
          images = [item.images];
        } else if (item.image_link) {
          images = [item.image_link];
        }

        return {
          name,
          price,
          mrp,
          description: item.description || `${name} - authentic Korean skincare.`,
          shortDescription: item.shortDescription || item.description?.slice(0, 100),
          category: item.category || "",
          brand: item.brand || "",
          images,
          stock: parseInt(String(item.stock || "30")) || 30,
          sku: item.sku || "",
        };
      });

    if (cleanList.length === 0) {
      setErrorMessage("No valid products found in the file.");
      setParsedProducts([]);
    } else {
      setParsedProducts(cleanList);
      setErrorMessage("");
    }
  };

  // Submit Bulk Import to API
  const handleConfirmImport = async () => {
    if (parsedProducts.length === 0) return;

    setIsImporting(true);
    setErrorMessage("");
    setImportStatus(`Importing ${parsedProducts.length} products to database...`);

    try {
      const res = await fetch("/api/admin/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: parsedProducts,
          defaultCategoryId,
          defaultBrandId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImportStatus(`Success! Imported ${data.importedCount} products into your catalog.`);
        setTimeout(() => {
          onImportSuccess(data.products || []);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || "Failed to complete bulk import.");
        setIsImporting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to import server.");
      setIsImporting(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(waExtractorCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-blumac-beige max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blumac-beige shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-700 text-white rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blumac-navy font-serif">
                Import Products to BLUMAC
              </h2>
              <p className="text-xs text-blumac-slate">
                WhatsApp Business Catalog, Meta Commerce Manager CSV, or Excel file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blumac-slate hover:bg-blumac-ivory transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blumac-beige mt-3 shrink-0">
          <button
            onClick={() => setActiveTab("UPLOAD")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "UPLOAD"
                ? "border-blumac-navy text-blumac-navy"
                : "border-transparent text-blumac-slate hover:text-blumac-navy"
            }`}
          >
            1. Upload File (CSV / JSON)
          </button>
          <button
            onClick={() => setActiveTab("WHATSAPP_SCRIPT")}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "WHATSAPP_SCRIPT"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-blumac-slate hover:text-blumac-navy"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Web 1-Click Extractor
          </button>
          <button
            onClick={() => setActiveTab("META_GUIDE")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "META_GUIDE"
                ? "border-blumac-copper text-blumac-copper font-bold"
                : "border-transparent text-blumac-slate hover:text-blumac-navy"
            }`}
          >
            Meta Commerce Export Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD & PREVIEW */}
          {activeTab === "UPLOAD" && (
            <div className="space-y-4">
              {/* Drag/Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blumac-beige hover:border-blumac-copper bg-blumac-ivory/50 hover:bg-blumac-ivory p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
              >
                <FileSpreadsheet className="w-10 h-10 text-blumac-copper group-hover:scale-110 transition-transform mb-2" />
                <p className="text-xs font-bold text-blumac-navy">
                  Click to select WhatsApp JSON or CSV File
                </p>
                <p className="text-[11px] text-blumac-slate mt-0.5">
                  Supports Meta Commerce Catalog CSV, Shopify CSV, or WhatsApp Web JSON
                </p>
                {fileName && (
                  <span className="mt-2 text-xs font-semibold px-2.5 py-1 bg-white border border-blumac-beige rounded-md text-emerald-700">
                    Selected: {fileName}
                  </span>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.json"
                  className="hidden"
                />
              </div>

              {/* Defaults Selection */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-blumac-ivory rounded-xl border border-blumac-beige">
                <div>
                  <label className="text-[11px] font-bold text-blumac-slate block mb-1">
                    Fallback Category
                  </label>
                  <select
                    value={defaultCategoryId}
                    onChange={(e) => setDefaultCategoryId(e.target.value)}
                    className="w-full bg-white border border-blumac-beige rounded-lg p-2 text-xs text-blumac-navy focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-blumac-slate block mb-1">
                    Fallback Brand
                  </label>
                  <select
                    value={defaultBrandId}
                    onChange={(e) => setDefaultBrandId(e.target.value)}
                    className="w-full bg-white border border-blumac-beige rounded-lg p-2 text-xs text-blumac-navy focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parsed Products Preview List */}
              {parsedProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blumac-navy">
                    <span>
                      Preview Products ({parsedProducts.length} items ready to import)
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Validated
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-blumac-beige rounded-xl divide-y divide-blumac-beige bg-white">
                    {parsedProducts.slice(0, 20).map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-blumac-ivory/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blumac-ivory border border-blumac-beige shrink-0 overflow-hidden relative">
                            {prod.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-blumac-slate m-auto absolute inset-0" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-blumac-navy truncate">{prod.name}</p>
                            <p className="text-[11px] text-blumac-slate truncate">
                              {prod.category || "General"} • Stock: {prod.stock}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-blumac-navy">
                            {formatCurrency(prod.price)}
                          </p>
                          {prod.mrp > prod.price && (
                            <p className="text-[10px] text-blumac-slate line-through">
                              {formatCurrency(prod.mrp)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {parsedProducts.length > 20 && (
                      <div className="p-2 text-center text-[11px] text-blumac-slate font-medium bg-blumac-ivory/30">
                        + {parsedProducts.length - 20} more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WHATSAPP WEB EXTRACTOR CODE */}
          {activeTab === "WHATSAPP_SCRIPT" && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Instant WhatsApp Web Catalog Extractor (10 Seconds)
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Kyunki WhatsApp public links ko login ke bina block karta hai, aap apne computer me WhatsApp Web kholein jahan aapka number already logged in hai:
                </p>
              </div>

              <ol className="text-xs text-blumac-navy space-y-2 list-decimal list-inside bg-white p-3 border border-blumac-beige rounded-xl">
                <li>
                  Computer me <strong>web.whatsapp.com</strong> open karein aur apne business catalog par jayein.
                </li>
                <li>
                  Keyboard par <strong>F12</strong> dabayein (ya Right-click karke <em>Inspect</em> karein), aur <strong>Console</strong> tab par click karein.
                </li>
                <li>
                  Neeche diya gaya code copy karke Console me paste karein aur <strong>Enter</strong> dabayein:
                </li>
              </ol>

              <div className="relative">
                <pre className="p-3 bg-blumac-navy text-blumac-copperLight text-[11px] rounded-xl overflow-x-auto max-h-40 font-mono">
                  {waExtractorCode}
                </pre>
                <button
                  onClick={handleCopyScript}
                  className="absolute top-2 right-2 px-2.5 py-1.5 bg-blumac-copper hover:bg-blumac-copperDark text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl flex items-center justify-between text-xs text-blumac-navy">
                <span>File download hone ke baad:</span>
                <button
                  onClick={() => setActiveTab("UPLOAD")}
                  className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg font-bold flex items-center gap-1 hover:bg-blumac-copper transition-colors"
                >
                  <span>Go to Upload Tab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: META COMMERCE GUIDE */}
          {activeTab === "META_GUIDE" && (
            <div className="space-y-3 text-xs text-blumac-navy">
              <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl space-y-2">
                <h4 className="font-bold flex items-center gap-1.5 text-blumac-copper">
                  <Info className="w-4 h-4" />
                  Meta Commerce Manager se Official CSV download karein
                </h4>
                <p className="text-[11px] text-blumac-slate leading-relaxed">
                  WhatsApp Business ka sabhi catalog Meta ecosystem ke sath synced rehta hai. Aap directly Meta se official high-resolution CSV download kar sakte hain:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-blumac-navy">
                  <li>
                    Browser me <strong>business.facebook.com/commerce</strong> login karein.
                  </li>
                  <li>
                    Apna <strong>Catalog</strong> select karein.
                  </li>
                  <li>
                    Left menu me <strong>Catalog Items</strong> ya <strong>Data Sources</strong> par click karein.
                  </li>
                  <li>
                    Upar <strong>Export / Download CSV</strong> button dabayein.
                  </li>
                  <li>
                    Download ki gayi file ko hamare <strong>Upload Tab</strong> me upload kar dein!
                  </li>
                </ol>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab("UPLOAD")}
                  className="px-4 py-2 bg-blumac-navy text-white rounded-lg font-bold hover:bg-blumac-copper transition-colors text-xs"
                >
                  I have the CSV file — Upload Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-blumac-beige shrink-0 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 border border-blumac-beige rounded-lg text-xs font-bold text-blumac-slate hover:bg-blumac-ivory disabled:opacity-50"
          >
            Cancel
          </button>

          {activeTab === "UPLOAD" && (
            <button
              onClick={handleConfirmImport}
              disabled={parsedProducts.length === 0 || isImporting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              {isImporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import {parsedProducts.length} Products to Website</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
