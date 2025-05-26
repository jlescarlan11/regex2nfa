// components/NfaVisualizationCard.tsx
"use client";
import React from "react";

export const EmptyStateIllustration = () => (
  <div className="relative">
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-gray-300"
    >
      {/* Start state */}
      <circle
        cx="20"
        cy="40"
        r="12"
        fill="blue-500"
        fillOpacity="0.1"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <text
        x="20"
        y="45"
        textAnchor="middle"
        className="text-xs fill-blue-500 font-medium"
      >
        S
      </text>

      {/* Arrow */}
      <path
        d="M35 40 L65 40 M60 35 L65 40 L60 45"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        strokeDasharray="3 3"
      />

      {/* Accept state */}
      <circle
        cx="100"
        cy="40"
        r="12"
        fill="#10b981"
        fillOpacity="0.1"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle
        cx="100"
        cy="40"
        r="8"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <text
        x="100"
        y="45"
        textAnchor="middle"
        className="text-xs fill-emerald-500 font-medium"
      >
        F
      </text>
    </svg>

    {/* Animated pulse effect */}
    <div className="absolute inset-0 animate-pulse opacity-30">
      <div className="w-6 h-6 bg-blue-400 rounded-full absolute left-[14px] top-[34px]" />
      <div className="w-6 h-6 bg-emerald-400 rounded-full absolute right-[14px] top-[34px]" />
    </div>
  </div>
);
