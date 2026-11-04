"use client";

import { useEffect } from "react";

export function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // WebMCP In-Browser Agent Registration
    const nav = window.navigator as any;
    if (nav?.modelContext && typeof nav.modelContext.registerTool === "function") {
      try {
        // Tool 1: Search Products
        nav.modelContext.registerTool({
          name: "search_products",
          description:
            "Search BLUMAC's authentic Korean skincare catalog by product name, active ingredient, brand or category in India.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search keyword, e.g. snail mucin, sunscreen, centella, toner",
              },
            },
            required: ["query"],
          },
          execute: async ({ query }: { query: string }) => {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            return await res.json();
          },
        });

        // Tool 2: Check PIN Code Delivery SLA
        nav.modelContext.registerTool({
          name: "check_delivery_sla",
          description:
            "Check BlueDart and Delhivery shipping availability and estimated delivery days for an Indian 6-digit postal PIN code.",
          inputSchema: {
            type: "object",
            properties: {
              pincode: {
                type: "string",
                description: "6-digit Indian postal PIN code, e.g. 400076 or 110001",
              },
            },
            required: ["pincode"],
          },
          execute: async ({ pincode }: { pincode: string }) => {
            const cleanPin = pincode.trim();
            const isValid = /^\d{6}$/.test(cleanPin);
            if (!isValid) {
              return { serviceable: false, error: "Invalid 6-digit Indian PIN code" };
            }
            const isMetro = /^(11|40|56|60|70|50)\d{4}$/.test(cleanPin);
            return {
              pincode: cleanPin,
              serviceable: true,
              carrier: "BlueDart Express Air & Delhivery",
              sla: isMetro ? "2 - 3 business days" : "3 - 5 business days",
              codAvailable: true,
              freeShippingThresholdInr: 999,
            };
          },
        });

        // Tool 3: Get Store Highlights & Policies
        nav.modelContext.registerTool({
          name: "get_store_policies",
          description:
            "Get BLUMAC Korean Store's authenticity guarantee, shipping fees, return window, and customer support channels in India.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => ({
            store: "BLUMAC Korean Store",
            authenticity: "100% genuine products with manufacturer holographic seals imported from Seoul",
            freeShippingMinInr: 999,
            standardShippingFeeInr: 99,
            returnWindowDays: 7,
            supportEmail: "care@blumac.in",
            supportPhone: "+91-9820098200",
          }),
        });
      } catch (err) {
        console.warn("[WebMCP] Registration notice:", err);
      }
    }
  }, []);

  return null;
}
