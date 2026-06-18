import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Search, Briefcase, Code2, MessageSquare, BarChart3, LayoutDashboard, Settings, Brain } from "lucide-react";
import api from "../api/axios";

const STATIC_ACTIONS = [
  { id: "dash",  label: "Dashboard",      icon: LayoutDashboard, to: "/"             },
  { id: "apps",  label: "Applications",   icon: Briefcase,       to: "/applications" },
  { id: "dsa",   label: "DSA Tracker",    icon: Code2,           to: "/dsa"          },
  { id: "int",   label: "Interview Prep", icon: MessageSquare,   to: "/interview"    },
  { id: "ai",    label: "AI Coach",       icon: Brain,           to: "/ai-coach"     },
  { id: "ana",   label: "Analytics",      icon: BarChart3,       to: "/analytics"    },
  { id: "set",   label: "Settings",       icon: Settings,        to: "/settings"     },
];

export default function CommandPalette({ open, onClose }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [idx,     setIdx]     = useState(0);
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);
  const inputRef   = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery(""); setIdx(0);
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power2.out" });
      gsap.fromTo(panelRef.current, { opacity: 0, y: -12, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power3.out" });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults(STATIC_ACTIONS.map((a) => ({ ...a, type: "nav" }))); return; }
    const q = query.toLowerCase();
    const nav = STATIC_ACTIONS.filter((a) => a.label.toLowerCase().includes(q)).map((a) => ({ ...a, type: "nav" }));

    Promise.all([
      api.get("/applications").catch(() => ({ data: [] })),
      api.get("/dsa").catch(() => ({ data: [] })),
      api.get("/interview").catch(() => ({ data: [] })),
    ]).then(([appRes, dsaRes, intRes]) => {
      const apps = appRes.data.filter((a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
        .slice(0, 3).map((a) => ({ id: a.id, label: `${a.company} — ${a.role}`, sub: a.status, icon: Briefcase, to: "/applications", type: "app" }));
      const dsa = dsaRes.data.filter((p) => p.title.toLowerCase().includes(q))
        .slice(0, 3).map((p) => ({ id: p.id, label: p.title, sub: `${p.topic} · ${p.difficulty}`, icon: Code2, to: "/dsa", type: "dsa" }));
      const ints = intRes.data.filter((i) => i.question.toLowerCase().includes(q))
        .slice(0, 3).map((i) => ({ id: i.id, label: i.question.slice(0, 60), sub: i.category, icon: MessageSquare, to: "/interview", type: "int" }));
      setResults([...nav, ...apps, ...dsa, ...ints].slice(0, 10));
      setIdx(0);
    });
  }, [query]);

  function close() {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.12, onComplete: onClose });
  }

  function select(item) {
    navigate(item.to);
    close();
  }

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[idx]) select(results[idx]);
    if (e.key === "Escape") close();
  }

  if (!open) return null;

  return (
    <div ref={overlayRef} className="cmd-backdrop fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" style={{ background: "rgba(0,0,0,0.45)" }} onClick={close}>
      <div
        ref={panelRef}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Search size={15} style={{ color: "var(--color-muted)", shrink: 0 }} />
          <input
            ref={inputRef}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
            placeholder="Search pages, applications, problems…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#EDEAE5", fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1.5">
          {results.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: "var(--color-muted)" }}>No results found</p>
          )}
          {results.map((item, i) => (
            <button
              key={`${item.type}-${item.id}`}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{ background: i === idx ? "var(--color-bg)" : "transparent" }}
              onMouseEnter={() => setIdx(i)}
              onClick={() => select(item)}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: i === idx ? "var(--color-primary)" : "#F0EDEA" }}>
                <item.icon size={13} color={i === idx ? "#fff" : "var(--color-muted)"} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{item.label}</p>
                {item.sub && <p className="text-[11px] truncate" style={{ color: "var(--color-muted)" }}>{item.sub}</p>}
              </div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 flex items-center gap-3 text-[11px]" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}>
          <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
