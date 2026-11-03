import React from "react";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import { getStoreProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | BLUMAC Korean Store",
    };
  }

  return {
    title: `${product.name} by ${product.brand} | BLUMAC Korean Store`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} - 100% Authentic Korean Skincare`,
      description: product.shortDescription,
      images: product.images,
    },
  };
}


export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
