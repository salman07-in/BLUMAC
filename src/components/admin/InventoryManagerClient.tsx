"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Warehouse, Plus, Minus, AlertTriangle, CheckCircle2, History } from "lucide-react";

interface InventoryManagerClientProps {
  initialInventories: any[];
}

export function InventoryManagerClient({
  initialInventories,
}: InventoryManagerClientProps) {
  const [inventories, setInventories] = useState(initialInventories);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("RESTOCK");
  const [loading, setLoading] = useState(false);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustmentQty) return;
    setLoading(true);

    try {
      const delta = parseInt(adjustmentQty);
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedItem.id,
          quantityDelta: delta,
          reason: adjustmentReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.inventory) {
        setInventories((prev) =>
          prev.map((inv) => (inv.id === data.inventory.id ? data.inventory : inv))
        );
        setSelectedItem(null);
        setAdjustmentQty("");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blumac-navy text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">SKU Code</th>
                <th className="py-3 px-4 font-bold">Product & Variant</th>
                <th className="py-3 px-4 font-bold">Total on Hand</th>
                <th className="py-3 px-4 font-bold">Reserved in Carts</th>
                <th className="py-3 px-4 font-bold">Available to Sell</th>
                <th className="py-3 px-4 font-bold">Threshold Alert</th>
                <th className="py-3 px-4 font-bold text-right">Quick Stock Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {inventories.map((inv) => {
                const available = inv.quantityOnHand - inv.reservedQuantity;
                const isLow = available <= inv.lowStockThreshold;

                return (
                  <tr key={inv.id} className="hover:bg-blumac-ivory/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blumac-navy">
                      {inv.variant?.sku || "SKU-N/A"}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-blumac-navy">
                        {inv.variant?.product?.name || "Skincare Item"}
                      </p>
                      <p className="text-[11px] text-blumac-slate">
                        Size: {inv.variant?.size || "Standard"} • Price: {formatCurrency(inv.variant?.price || 0)}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-bold text-blumac-navy">
                      {inv.quantityOnHand} units
                    </td>

                    <td className="py-3 px-4 text-blumac-slate">
                      {inv.reservedQuantity} reserved
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-extrabold ${
                          isLow ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {available} units
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Healthy Level
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(inv)}
                        className="px-3 py-1.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg text-xs font-bold transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige">
            <h3 className="text-base font-bold text-blumac-navy font-serif">
              Adjust Inventory Stock: {selectedItem.variant?.sku}
            </h3>
            <p className="text-xs text-blumac-slate">
              {selectedItem.variant?.product?.name} (Current: {selectedItem.quantityOnHand} units)
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Quantity Adjustment (positive to add, negative to reduce) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +20 or -5"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy cursor-pointer"
                >
                  <option value="RESTOCK">Fresh Shipment / Restock from Seoul</option>
                  <option value="AUDIT_CORRECTION">Physical Inventory Audit Correction</option>
                  <option value="DAMAGED">Damaged / Expired in Transit</option>
                  <option value="PROMOTIONAL">Sample / Influencer PR Kit</option>
                </select>
              </div>

              <div className="pt-3 border-t border-blumac-beige flex justify-end gap-3">
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
                  className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  {loading ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
