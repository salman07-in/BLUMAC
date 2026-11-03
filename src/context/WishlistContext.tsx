"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load wishlist on mount
  useEffect(() => {
    const initWishlist = async () => {
      try {
        // Try to load from DB (logged in users)
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          if (data.wishlist && data.wishlist.length >= 0) {
            setIsLoggedIn(true);
            setWishlist(data.wishlist);
            // Also sync to localStorage for consistency
            localStorage.setItem("blumac_wishlist", JSON.stringify(data.wishlist));
            return;
          }
        }
      } catch {
        // If API fails, fall back to localStorage
      }
      // Guest: load from localStorage
      try {
        const saved = localStorage.getItem("blumac_wishlist");
        if (saved) setWishlist(JSON.parse(saved));
      } catch {}
    };
    initWishlist();
  }, []);

  const toggleWishlist = useCallback(async (id: string) => {
    const isCurrentlyIn = wishlist.includes(id);

    // Optimistic update
    const next = isCurrentlyIn ? wishlist.filter((item) => item !== id) : [...wishlist, id];
    setWishlist(next);
    try { localStorage.setItem("blumac_wishlist", JSON.stringify(next)); } catch {}

    // Sync to DB if logged in
    if (isLoggedIn) {
      try {
        const method = isCurrentlyIn ? "DELETE" : "POST";
        await fetch(`/api/wishlist/${id}`, { method });
      } catch {
        // If DB sync fails, revert
        setWishlist(wishlist);
        try { localStorage.setItem("blumac_wishlist", JSON.stringify(wishlist)); } catch {}
      }
    }
  }, [wishlist, isLoggedIn]);

  const isInWishlist = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
