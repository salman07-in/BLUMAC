import React from "react";
import Image from "next/image";

interface BlumacLogoProps {
  variant?: "full" | "horizontal" | "mark-only" | "image";
  className?: string;
  width?: number;
  height?: number;
  light?: boolean;
}

export function BlumacLogo({
  variant = "image",
  className = "",
  width = 160,
  height = 56,
  light = false,
}: BlumacLogoProps) {
  // If image variant is requested or standard
  if (variant === "image") {
    const src = light ? "/images/blumac-logo-light.png" : "/images/blumac-logo.png";
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src={src}
          alt="BLUMAC Korean Store"
          width={width}
          height={height}
          priority
          style={{ width: "auto", height: `${height}px` }}
          className="object-contain"
        />
      </div>
    );
  }

  // Vector rendering of the official geometric BM shield emblem and brandmark
  const navyColor = light ? "#FFFFFF" : "#142B50";
  const copperColor = "#C77B64";
  const subtextColor = light ? "#E8E3DA" : "#142B50";

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 280 280"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="shieldNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#142B50" />
            <stop offset="100%" stop-color="#0B182D" />
          </linearGradient>
          <linearGradient id="shieldCopper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#DE9984" />
            <stop offset="50%" stop-color="#C77B64" />
            <stop offset="100%" stop-color="#A85E48" />
          </linearGradient>
        </defs>

        {/* Geometric Hexagonal Crest */}
        <g transform="translate(140, 78) scale(1.15)">
          {/* Left Wing - Stylized 'B' in Navy */}
          <path
            d="M-3, -48 L-28, -32 L-28, 6 L-3, -8 Z"
            fill={light ? "#FFFFFF" : "url(#shieldNavy)"}
          />
          <path
            d="M-28, 6 L-28, 30 L-3, 46 L-3, 30 L-16, 20 L-16, 12 Z"
            fill={light ? "#FFFFFF" : "url(#shieldNavy)"}
          />
          <path
            d="M-14, -18 L-5, -23 L-5, -12 L-14, -7 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Right Wing - Stylized 'M' in Copper / Rose Gold */}
          <path
            d="M3, -48 L28, -32 L28, 30 L3, 46 L3, 30 L16, 20 L16, -18 L3, -8 Z"
            fill="url(#shieldCopper)"
          />
          <path
            d="M5, -4 L16, 8 L26, -12 L26, -26 L16, -6 L5, -20 Z"
            fill="url(#shieldCopper)"
          />
        </g>

        {/* Brand Text Typography */}
        <g transform="translate(140, 192)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="'Playfair Display', system-ui, sans-serif"
            fontSize="32"
            fontWeight="800"
            letterSpacing="5"
          >
            <tspan fill={navyColor}>BLU</tspan>
            <tspan fill={copperColor}>MAC</tspan>
          </text>
        </g>

        {/* Divider Bar with Center Diamond */}
        <g transform="translate(140, 212)">
          <line
            x1="-80"
            y1="0"
            x2="-10"
            y2="0"
            stroke={copperColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <polygon
            points="0,-3.5 3.5,0 0,3.5 -3.5,0"
            fill={copperColor}
          />
          <line
            x1="10"
            y1="0"
            x2="80"
            y2="0"
            stroke={copperColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Subtitle */}
        <g transform="translate(140, 234)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontSize="10"
            fontWeight="600"
            letterSpacing="6"
            fill={subtextColor}
            opacity="0.85"
          >
            KOREAN STORE
          </text>
        </g>
      </svg>
    </div>
  );
}
