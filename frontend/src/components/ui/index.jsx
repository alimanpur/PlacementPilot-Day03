import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* ─── Button ─────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "btn-press inline-flex items-center gap-2 font-semibold rounded-lg transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none tracking-[-0.01em]";
  const variants = {
    primary: "hover:brightness-110 active:brightness-95",
    outline: "hover:bg-black/[0.04] active:bg-black/[0.07]",
    ghost:   "hover:bg-black/[0.04] active:bg-black/[0.07]",
    danger:  "hover:brightness-110 active:brightness-95",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[13px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-5 py-2.5 text-sm",
  };
  const styles = {
    primary: { background: "var(--color-primary)", color: "#fff" },
    outline: { border: "1px solid var(--color-border)", color: "var(--color-text)", background: "var(--color-surface-2)" },
    ghost:   { color: "var(--color-text)", background: "transparent" },
    danger:  { background: "var(--color-danger)", color: "#fff" },
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} style={styles[variant]} {...props}>
      {children}
    </button>
  );
}

/* ─── Input ──────────────────────────────────────── */
export function Input({ label, error, hint, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-semibold tracking-wide" style={{ color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <input
        className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-shadow ${className}`}
        style={{
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
          background: "var(--color-surface)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          boxShadow: "var(--shadow-card)",
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(35,78,82,0.14)")}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
        {...props}
      />
      {error && <p className="text-[12px]" style={{ color: "var(--color-danger)" }}>{error}</p>}
      {hint && !error && <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>{hint}</p>}
    </div>
  );
}

/* ─── Select ─────────────────────────────────────── */
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-semibold tracking-wide" style={{ color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <select
        className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none ${className}`}
        style={{
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
          background: "var(--color-surface)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          boxShadow: "var(--shadow-card)",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[12px]" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

/* ─── Textarea ───────────────────────────────────── */
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-semibold tracking-wide" style={{ color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
      <textarea
        className={`w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none transition-shadow ${className}`}
        rows={3}
        style={{
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
          background: "var(--color-surface)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          boxShadow: "var(--shadow-card)",
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(35,78,82,0.14)")}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
        {...props}
      />
      {error && <p className="text-[12px]" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

/* ─── Badge ──────────────────────────────────────── */
const STATUS_MAP = {
  Applied:   { bg: "#EFF6FF", color: "#2563EB" },
  Interview: { bg: "#FFF7ED", color: "#C2410C" },
  Offer:     { bg: "#F0FDF4", color: "#16A34A" },
  Rejected:  { bg: "#FEF2F2", color: "#DC2626" },
  Withdrawn: { bg: "#F9FAFB", color: "#6B7280" },
  Easy:      { bg: "#F0FDF4", color: "#16A34A" },
  Medium:    { bg: "#FFF7ED", color: "#C2410C" },
  Hard:      { bg: "#FEF2F2", color: "#DC2626" },
};
export function Badge({ label }) {
  const c = STATUS_MAP[label] || { bg: "#F3F4F6", color: "#374151" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold" style={c}>
      {label}
    </span>
  );
}

/* ─── Modal ──────────────────────────────────────── */
export function Modal({ open, onClose, title, children, wide = false }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  useEffect(() => {
    if (open) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(panelRef.current, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" });
    }
  }, [open]);

  if (!open) return null;

  function handleClose() {
    gsap.to(panelRef.current,   { opacity: 0, y: 10, scale: 0.97, duration: 0.15, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.15, onComplete: onClose });
  }

  return (
    <div ref={overlayRef} className="cmd-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={handleClose}>
      <div
        ref={panelRef}
        className={`w-full rounded-xl p-6 ${wide ? "max-w-2xl" : "max-w-md"}`}
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5" style={{ color: "var(--color-muted)" }} aria-label="Close">
            <span className="text-sm leading-none">✕</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── PageHeader ─────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight leading-tight" style={{ letterSpacing: "-0.02em" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────── */
export function Card({ children, className = "", hover = false, style = {} }) {
  return (
    <div
      className={`rounded-xl p-5 ${hover ? "card-hover" : ""} ${className}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SectionLabel ───────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)", letterSpacing: "0.1em" }}>
      {children}
    </p>
  );
}

/* ─── Skeleton ───────────────────────────────────── */
export function Skeleton({ className = "", style = {} }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-9 w-14 mb-2" />
      <Skeleton className="h-2.5 w-28 mt-2" />
    </div>
  );
}

/* ─── EmptyState ─────────────────────────────────── */
export function EmptyState({ icon: Icon, svg: Svg, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="mb-6 relative">
        {Svg ? (
          <Svg />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
            <Icon size={22} style={{ color: "var(--color-muted)" }} strokeWidth={1.4} />
          </div>
        )}
      </div>
      <p className="text-sm font-semibold mb-1.5 tracking-tight" style={{ color: "var(--color-text)" }}>{title}</p>
      <p className="text-[13px] leading-relaxed max-w-xs" style={{ color: "var(--color-muted)" }}>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── StatPill ───────────────────────────────────── */
export function StatPill({ label, value, color = "var(--color-primary)", bg = "#E6F0F0" }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold" style={{ background: bg, color }}>
      {label}: {value}
    </div>
  );
}

/* ─── Divider ────────────────────────────────────── */
export function Divider({ className = "" }) {
  return <div className={`h-px w-full ${className}`} style={{ background: "var(--color-border)" }} />;
}
