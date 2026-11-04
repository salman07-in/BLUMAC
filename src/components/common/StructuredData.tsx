import React from "react";
import { PRODUCTS } from "@/lib/products";

export function StructuredData() {
  const baseUrl = "https://blumac.in";

  const productSchemaElements = PRODUCTS.slice(0, 8).map((p, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Product",
      "@id": `${baseUrl}/product/${p.slug}#product`,
      "url": `${baseUrl}/product/${p.slug}`,
      "name": p.name,
      "description": p.shortDescription,
      "image": p.images[0] || `${baseUrl}/images/blumac-logo.png`,
      "brand": {
        "@type": "Brand",
        "name": p.brand,
      },
      "category": p.category,
      "sku": p.variants[0]?.sku || `BLU-${p.id}`,
      "offers": {
        "@type": "Offer",
        "url": `${baseUrl}/product/${p.slug}`,
        "priceCurrency": "INR",
        "price": p.price,
        "priceValidUntil": "2027-12-31",
        "availability": p.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": `${baseUrl}/#organization`,
        },
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": p.rating,
        "reviewCount": p.reviewCount,
        "bestRating": 5,
        "worstRating": 1,
      },
    },
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Store", "OnlineStore"],
        "@id": `${baseUrl}/#organization`,
        "name": "BLUMAC Korean Store",
        "legalName": "BLUMAC Korean Store India",
        "url": baseUrl,
        "logo": `${baseUrl}/images/blumac-logo.png`,
        "description":
          "India's premier authentic Korean skincare and cosmetics destination. 100% genuine products imported directly from Seoul, South Korea with all-India express delivery.",
        "email": "care@blumac.in",
        "telephone": "+91-9820098200",
        "priceRange": "₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking, Razorpay",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressRegion": "Maharashtra",
          "addressLocality": "Mumbai",
        },
        "sameAs": [
          "https://www.instagram.com/blumac.in",
          "https://www.facebook.com/blumac.in",
          "https://twitter.com/blumac_in",
          "https://www.linkedin.com/company/blumac-korean-store",
          "https://www.youtube.com/@blumac-korean-store",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "BLUMAC Korean Store",
        "description": "Authentic Korean Skincare & Cosmetics in India",
        "publisher": {
          "@id": `${baseUrl}/#organization`,
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/#best-sellers`,
        "name": "Best-Selling Authentic Korean Skincare Products",
        "numberOfItems": productSchemaElements.length,
        "itemListElement": productSchemaElements,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
