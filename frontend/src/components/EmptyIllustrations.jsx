/**
 * Premium SVG illustrations for empty states
 * Consistent design language — same stroke width, color palette, rounded corners
 */
import React from "react";

const baseProps = {
  viewBox: "0 0 200 160",
  fill: "none",
  "aria-hidden": "true",
  className: "w-24 h-20 mx-auto",
  style: { fontFamily: "system-ui, sans-serif" },
};

const stroke = "currentColor";
const sw = 1.4;

/* ── Applications ───────────────────────────────── */
export function AppsIllustration() {
  return (
    <svg {...baseProps}>
      {/* Document stack */}
      <rect x="55" y="40" width="90" height="100" rx="8" stroke={stroke} strokeWidth={sw} fill="var(--color-surface-2)" />
      <rect x="65" y="58" width="70" height="6" rx="3" stroke={stroke} strokeWidth={sw*0.7} />
      <rect x="65" y="72" width="50" height="6" rx="3" stroke={stroke} strokeWidth={sw*0.7} />
      <rect x="65" y="86" width="60" height="6" rx="3" stroke={stroke} strokeWidth={sw*0.7} />
      <rect x="65" y="100" width="40" height="6" rx="3" stroke={stroke} strokeWidth={sw*0.7} />
      {/* Star badge */}
      <circle cx="140" cy="42" r="16" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <path d="M140 35l2 6h6l-5 3.5 2 6.5-5-4-5 4 2-6.5-5-3.5h6z" stroke={stroke} strokeWidth={sw*0.7} />
      {/* Plus */}
      <line x1="48" y1="90" x2="48" y2="104" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="41" y1="97" x2="55" y2="97" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

/* ── DSA ─────────────────────────────────────────── */
export function DSAIllustration() {
  return (
    <svg {...baseProps}>
      {/* Code brackets */}
      <rect x="50" y="35" width="100" height="100" rx="10" stroke={stroke} strokeWidth={sw} fill="var(--color-surface-2)" />
      {/* Code lines */}
      <path d="M70 54l-8 6 8 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M100 66h-20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path d="M110 54l8 6-8 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 80h-10" stroke={stroke} strokeWidth={sw*0.7} strokeLinecap="round" />
      <path d="M75 92h-10" stroke={stroke} strokeWidth={sw*0.7} strokeLinecap="round" />
      <path d="M75 104h-10" stroke={stroke} strokeWidth={sw*0.7} strokeLinecap="round" />
      {/* Checkmark */}
      <circle cx="150" cy="40" r="14" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <path d="M145 40l4 4 7-7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Interview Prep ─────────────────────────────── */
export function InterviewIllustration() {
  return (
    <svg {...baseProps}>
      {/* Speech bubble */}
      <path d="M 50 50 h 100 q 10 0 10 10 v 40 q 0 10 -10 10 h -45 l -15 15 v -15 h -40 q -10 0 -10 -10 v -40 q 0 -10 10 -10 z" stroke={stroke} strokeWidth={sw} fill="var(--color-surface-2)" />
      {/* Question marks */}
      <text x="90" y="80" fontSize="28" fontWeight="bold" fill={stroke} textAnchor="middle">?</text>
      <text x="80" y="100" fontSize="12" fontWeight="bold" fill={stroke} textAnchor="middle" opacity="0.5">?</text>
      <text x="100" y="95" fontSize="10" fontWeight="bold" fill={stroke} textAnchor="middle" opacity="0.4">?</text>
      {/* Mic */}
      <rect x="140" y="110" width="8" height="14" rx="4" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <path d="M136 118c0 8 8 8 8 8s8 0 8-8" stroke={stroke} strokeWidth={sw} fill="none" />
      <line x1="144" y1="126" x2="144" y2="134" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

/* ── Analytics ──────────────────────────────────── */
export function AnalyticsIllustration() {
  return (
    <svg {...baseProps}>
      {/* Chart area */}
      <rect x="45" y="30" width="110" height="100" rx="8" stroke={stroke} strokeWidth={sw} fill="var(--color-surface-2)" />
      {/* Grid lines */}
      <line x1="60" y1="50" x2="145" y2="50" stroke={stroke} strokeWidth={sw*0.5} opacity="0.3" />
      <line x1="60" y1="70" x2="145" y2="70" stroke={stroke} strokeWidth={sw*0.5} opacity="0.3" />
      <line x1="60" y1="90" x2="145" y2="90" stroke={stroke} strokeWidth={sw*0.5} opacity="0.3" />
      <line x1="60" y1="110" x2="145" y2="110" stroke={stroke} strokeWidth={sw*0.5} opacity="0.3" />
      {/* Bars */}
      <rect x="65" y="85" width="14" height="35" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <rect x="85" y="70" width="14" height="50" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <rect x="105" y="55" width="14" height="65" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      <rect x="125" y="75" width="14" height="45" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--color-surface)" />
      {/* Trending up arrow */}
      <path d="M68 88l18-12 18 8 20-18" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}