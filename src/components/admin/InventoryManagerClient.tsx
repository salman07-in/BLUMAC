"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Warehouse,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  History,
  Search,
  Download,
  RefreshCw,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InventoryManagerClientProps {
  initialInventories: any[];
}

export function InventoryManagerClient({
  initialInventories,
}: InventoryManagerClientProps) {
  const [inventories, setInventories] = useState(initialInventories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "HEALTHY"
  >("ALL");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adjustMode, setAdjustMode] = useState<"ADD" | "REMOVE" | "EXACT">("ADD");
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("RESTOCK");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [newThreshold, setNewThreshold] = useState<string>("5");
  const [loading, setLoading] = useState(false);

  // History Audit Modal
  const [historyItem, setHistoryItem] = useState<any | null>(null);
  const [movementsList, setMovementsList] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    let totalOnHand = 0;
    let totalReserved = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const inv of inventories) {
      totalOnHand += inv.quantityOnHand;
      totalReserved += inv.reservedQuantity;
      const available = inv.quantityOnHand - inv.reservedQuantity;
      if (available <= 0) {
        outOfStockCount++;
      } else if (available <= inv.lowStockThreshold) {
        lowStockCount++;
      }
    }

    return {
      totalOnHand,
      totalReserved,
      availableToSell: Math.max(0, totalOnHand - totalReserved),
      lowStockCount,
      outOfStockCount,
      healthyCount: inventories.length - lowStockCount - outOfStockCount,
    };
  }, [inventories]);

  // Filtered & Paginated Items
  const filtered = useMemo(() => {
    return inventories.filter((inv) => {
      const available = inv.quantityOnHand - inv.reservedQuantity;
      if (statusFilter === "OUT_OF_STOCK" && available > 0) return false;
      if (statusFilter === "LOW_STOCK" && (available <= 0 || available > inv.lowStockThreshold)) {
        return false;
      }
      if (statusFilter === "HEALTHY" && available <= inv.lowStockThreshold) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const skuMatch = inv.variant?.sku?.toLowerCase().includes(q);
      const nameMatch = inv.variant?.product?.name?.toLowerCase().includes(q);
      return skuMatch || nameMatch;
    });
  }, [inventories, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Open Adjust Stock Modal
  const openAdjustModal = (inv: any, mode: "ADD" | "REMOVE" | "EXACT" = "ADD") => {
    setSelectedItem(inv);
    setAdjustMode(mode);
    setAdjustmentQty("");
    setAdjustmentNotes("");
    setNewThreshold(inv.lowStockThreshold?.toString() || "5");
    if (mode === "ADD") setAdjustmentReason("RESTOCK");
    else if (mode === "REMOVE") setAdjustmentReason("DAMAGED_IN_TRANSIT");
    else setAdjustmentReason("AUDIT_RECONCILIATION");
  };

  // Submit Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);

    try {
      let delta: number | undefined = undefined;
      let exact: number | undefined = undefined;

      if (adjustMode === "EXACT") {
        exact = Math.max(0, parseInt(adjustmentQty) || 0);
      } else {
        const parsedVal = Math.abs(parseInt(adjustmentQty) || 0);
        delta = adjustMode === "ADD" ? parsedVal : -parsedVal;
      }

      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedItem.id,
          quantityDelta: delta,
          exactQuantity: exact,
          lowStockThreshold: parseInt(newThreshold) || 5,
          reason: adjustmentReason,
          notes: adjustmentNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.inventory) {
        setInventories((prev) =>
          prev.map((inv) => (inv.id === data.inventory.id ? data.inventory : inv))
        );
        setSelectedItem(null);
      } else {
        alert(data.error || "Failed to commit stock adjustment");
      }
    } catch {
      alert("Network error adjusting stock");
    } finally {
      setLoading(false);
    }
  };

  // Open Movement History Modal
  const openHistoryModal = async (inv: any) => {
    setHistoryItem(inv);
    setLoadingMovements(true);

    try {
      const res = await fetch(`/api/admin/inventory/${inv.id}/movements`);
      const data = await res.json();
      if (res.ok && data.movements) {
        setMovementsList(data.movements);
      } else {
        setMovementsList(inv.movements || []);
      }
    } catch {
      setMovementsList(inv.movements || []);
    } finally {
      setLoadingMovements(false);
    }
  };

  // Export Inventory CSV
  const exportInventoryCSV = () => {
    const headers =
      "SKU,Product Name,Variant Size,Price,On Hand,Reserved,Available To Sell,Threshold,Status\n";
    const rows = filtered
      .map((inv) => {
        const available = inv.quantityOnHand - inv.reservedQuantity;
        const status =
          available <= 0
            ? "OUT_OF_STOCK"
            : available <= inv.lowStockThreshold
            ? "LOW_STOCK"
            : "HEALTHY";
        return `"${inv.variant?.sku || ""}","${(inv.variant?.product?.name || "").replace(
          /"/g,
          '""'
        )}","${inv.variant?.size || "Standard"}",${inv.variant?.price || 0},${
          inv.quantityOnHand
        },${inv.reservedQuantity},${available},${inv.lowStockThreshold},"${status}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blumac-inventory-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-blumac-beige shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Total on Hand
            </span>
            <Warehouse className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-2xl font-extrabold text-blumac-navy font-mono">
            {metrics.totalOnHand.toLocaleString()}
          </p>
          <p className="text-[10px] text-blumac-slate">Physical units in warehouse</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blumac-beige shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Reserved Buffers
            </span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono">
            {metrics.totalReserved.toLocaleString()}
          </p>
          <p className="text-[10px] text-blumac-slate">Locked in active checkouts</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blumac-beige shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Available to Sell
            </span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-green-700 font-mono">
            {metrics.availableToSell.toLocaleString()}
          </p>
          <p className="text-[10px] text-blumac-slate">Net live stock on storefront</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blumac-beige shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Stock Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600 font-mono">
              {metrics.lowStockCount}
            </span>
            <span className="text-[11px] font-bold text-blumac-slate">
              ({metrics.outOfStockCount} OOS)
            </span>
          </div>
          <p className="text-[10px] text-red-600 font-semibold">Critical restock needed</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-blumac-beige shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by SKU or product name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2 pl-9 pr-4 text-blumac-navy focus:outline-none focus:border-blumac-copper"
            />
            <Search className="w-4 h-4 text-blumac-slate absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 text-blumac-slate">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-blumac-ivory border border-blumac-beige rounded-lg py-1.5 px-2 text-blumac-navy font-semibold cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-blumac-navy text-white shadow-sm"
                  : "bg-blumac-ivory text-blumac-slate hover:bg-blumac-beige"
              }`}
            >
              All ({inventories.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("LOW_STOCK");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                statusFilter === "LOW_STOCK"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Low Stock ({metrics.lowStockCount})</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("OUT_OF_STOCK");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === "OUT_OF_STOCK"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              Out of Stock ({metrics.outOfStockCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("HEALTHY");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === "HEALTHY"
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}
            >
              Healthy ({metrics.healthyCount})
            </button>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportInventoryCSV}
            className="px-3.5 py-2 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Export Inventory Report</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B182D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">SKU Code</th>
                <th className="py-3.5 px-4 font-bold">Product Name & Variant</th>
                <th className="py-3.5 px-4 font-bold">Physical on Hand</th>
                <th className="py-3.5 px-4 font-bold">Reserved</th>
                <th className="py-3.5 px-4 font-bold">Available to Sell</th>
                <th className="py-3.5 px-4 font-bold">Stock Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Audit & Adjust Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blumac-slate">
                    <Package className="w-8 h-8 text-blumac-copper/40 mx-auto mb-2" />
                    <p className="font-semibold">No inventory records match filters.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => {
                  const available = Math.max(0, inv.quantityOnHand - inv.reservedQuantity);
                  const isOut = available <= 0;
                  const isLow = available > 0 && available <= inv.lowStockThreshold;

                  return (
                    <tr key={inv.id} className="hover:bg-blumac-ivory/40 transition-colors">
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blumac-navy">
                        {inv.variant?.sku || "SKU-N/A"}
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-blumac-navy">
                          {inv.variant?.product?.name || "Skincare Product"}
                        </p>
                        <p className="text-[11px] text-blumac-slate mt-0.5">
                          Size: {inv.variant?.size || "Standard"} • Price: {formatCurrency(inv.variant?.price || 0)}
                        </p>
                      </td>

                      {/* On Hand */}
                      <td className="py-3.5 px-4 font-bold text-blumac-navy font-mono text-sm">
                        {inv.quantityOnHand} units
                      </td>

                      {/* Reserved */}
                      <td className="py-3.5 px-4 text-blumac-slate font-mono">
                        {inv.reservedQuantity} locked
                      </td>

                      {/* Available */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-sm">
                        <span
                          className={
                            isOut
                              ? "text-red-600"
                              : isLow
                              ? "text-amber-700"
                              : "text-green-700"
                          }
                        >
                          {available} units
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Healthy Level
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Movement History */}
                          <button
                            title="View Stock Movement Audit History"
                            onClick={() => openHistoryModal(inv)}
                            className="p-1.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg text-xs font-semibold transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-blumac-copper" />
                          </button>

                          {/* Quick Restock (+10) */}
                          <button
                            title="Quick Add 10 Units"
                            onClick={() => openAdjustModal(inv, "ADD")}
                            className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>

                          {/* Adjust / Deduct */}
                          <button
                            title="Deduct or Damage Stock"
                            onClick={() => openAdjustModal(inv, "REMOVE")}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Remove</span>
                          </button>

                          {/* Full Audit Setting */}
                          <button
                            title="Reconcile Exact Physical Count"
                            onClick={() => openAdjustModal(inv, "EXACT")}
                            className="px-2.5 py-1.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Audit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 bg-blumac-ivory/50 border-t border-blumac-beige flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-blumac-slate">
            Showing <strong className="text-blumac-navy">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-blumac-navy">
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{" "}
            of <strong className="text-blumac-navy">{filtered.length}</strong> items
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-blumac-navy bg-white border border-blumac-beige rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚖️ ADJUST / RECONCILE STOCK MODAL */}
      {/* ========================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <div>
                <h3 className="text-base font-bold text-blumac-navy font-serif">
                  Stock Adjustment: {selectedItem.variant?.sku}
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  {selectedItem.variant?.product?.name} ({selectedItem.variant?.size})
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 text-blumac-slate">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Mode Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustMode("ADD");
                  setAdjustmentReason("RESTOCK");
                }}
                className={`py-2 rounded-lg font-bold border transition-all ${
                  adjustMode === "ADD"
                    ? "bg-green-700 text-white border-green-700 shadow-xs"
                    : "bg-blumac-ivory text-blumac-slate border-blumac-beige"
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustMode("REMOVE");
                  setAdjustmentReason("DAMAGED_IN_TRANSIT");
                }}
                className={`py-2 rounded-lg font-bold border transition-all ${
                  adjustMode === "REMOVE"
                    ? "bg-rose-700 text-white border-rose-700 shadow-xs"
                    : "bg-blumac-ivory text-blumac-slate border-blumac-beige"
                }`}
              >
                - Remove Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustMode("EXACT");
                  setAdjustmentReason("AUDIT_RECONCILIATION");
                }}
                className={`py-2 rounded-lg font-bold border transition-all ${
                  adjustMode === "EXACT"
                    ? "bg-blumac-navy text-white border-blumac-navy shadow-xs"
                    : "bg-blumac-ivory text-blumac-slate border-blumac-beige"
                }`}
              >
                Exact Count
              </button>
            </div>

            {/* Current & Projected Metrics */}
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-blumac-slate">Current On Hand:</span>
                <p className="font-bold font-mono text-sm text-blumac-navy">
                  {selectedItem.quantityOnHand} units
                </p>
              </div>
              <div>
                <span className="text-blumac-slate">Reserved in Carts:</span>
                <p className="font-bold font-mono text-sm text-amber-700">
                  {selectedItem.reservedQuantity} units
                </p>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3.5">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  {adjustMode === "EXACT"
                    ? "New Exact Physical Count *"
                    : adjustMode === "ADD"
                    ? "Quantity to Add (Units) *"
                    : "Quantity to Remove (Units) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder={adjustMode === "EXACT" ? "e.g. 50" : "e.g. 10"}
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                >
                  {adjustMode === "ADD" && (
                    <>
                      <option value="RESTOCK">Direct Import / Fresh Shipment from Seoul</option>
                      <option value="PURCHASE_ORDER">Purchase Order Delivery</option>
                      <option value="CUSTOMER_RETURN">Customer Return Restock</option>
                    </>
                  )}
                  {adjustMode === "REMOVE" && (
                    <>
                      <option value="DAMAGED_IN_TRANSIT">Damaged / Broken in Transit</option>
                      <option value="EXPIRED_STOCK">Expired Stock in Warehouse</option>
                      <option value="THEFT_OR_LOSS">Stock Discrepancy / Lost Unit</option>
                      <option value="PROMOTIONAL_PR_KIT">Influencer PR / Marketing Kit</option>
                    </>
                  )}
                  {adjustMode === "EXACT" && (
                    <>
                      <option value="AUDIT_RECONCILIATION">Physical Inventory Cycle Count</option>
                      <option value="ANNUAL_AUDIT">Annual Warehouse Stock Audit</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-blumac-navy font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Admin Internal Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional reference, batch code, or reason notes..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-blumac-navy"
                />
              </div>

              <div className="pt-2 border-t border-blumac-beige flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Commit Stock Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📜 STOCK MOVEMENT AUDIT TRAIL MODAL */}
      {/* ========================================================= */}
      {historyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-blumac-beige max-h-[90vh] flex flex-col text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blumac-navy text-blumac-copperLight rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-blumac-navy">
                    Stock Movement History
                  </h3>
                  <p className="text-[11px] text-blumac-slate font-mono">
                    SKU: {historyItem.variant?.sku} • {historyItem.variant?.product?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="p-1 rounded-full hover:bg-blumac-ivory text-blumac-slate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {loadingMovements ? (
                <div className="py-12 text-center text-blumac-slate">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blumac-copper" />
                  <p>Loading audit ledger records...</p>
                </div>
              ) : movementsList.length === 0 ? (
                <div className="py-12 text-center text-blumac-slate">
                  <Package className="w-8 h-8 text-blumac-copper/40 mx-auto mb-2" />
                  <p className="font-semibold">No movement logs recorded yet for this SKU.</p>
                </div>
              ) : (
                <div className="border border-blumac-beige rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-blumac-navy text-white text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Quantity Changed</th>
                        <th className="p-2.5">Reason / Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blumac-beige">
                      {movementsList.map((m: any) => {
                        const isPositive = m.quantity > 0;
                        return (
                          <tr key={m.id} className="hover:bg-blumac-ivory/40">
                            <td className="p-2.5 text-blumac-slate font-mono text-[11px]">
                              {formatDate(m.createdAt)}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  m.type === "RESTOCK"
                                    ? "bg-green-100 text-green-800"
                                    : m.type === "DAMAGE"
                                    ? "bg-red-100 text-red-800"
                                    : m.type === "RETURN"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {m.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold font-mono">
                              <span className={isPositive ? "text-green-700" : "text-red-600"}>
                                {isPositive ? `+${m.quantity}` : m.quantity} units
                              </span>
                            </td>
                            <td className="p-2.5 text-blumac-charcoal">
                              {m.reason || "Manual inventory adjustment"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-blumac-beige flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                className="px-5 py-2 bg-blumac-navy text-white rounded-lg font-bold text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
