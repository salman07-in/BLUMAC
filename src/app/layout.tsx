import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { StoreFrontShell } from "@/components/layout/StoreFrontShell";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://blumac.in"),
  title: "BLUMAC Korean Store | Premium Korean Skincare & Cosmetics Delivered Across India",
  description:
    "Shop authentic Korean skincare and cosmetics at BLUMAC. Direct imports from Seoul: COSRX, Beauty of Joseon, Anua, Laneige & more with fast All-India delivery.",
  keywords: [
    "Korean skincare India",
    "K-beauty",
    "COSRX snail mucin India",
    "Beauty of Joseon sunscreen",
    "Korean cosmetics online",
    "Glass skin products",
    "Authentic Korean skincare",
  ],
  openGraph: {
    title: "BLUMAC Korean Store | 100% Authentic Korean Skincare in India",
    description:
      "Direct from Seoul to your doorstep. Free delivery all over India on orders above ₹999.",
    images: ["/images/blumac-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-blumac-ivory text-blumac-charcoal">
        <CartProvider>
          <WishlistProvider>
            <StoreFrontShell>{children}</StoreFrontShell>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
