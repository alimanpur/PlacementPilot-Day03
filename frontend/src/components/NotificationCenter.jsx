import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Bell, Briefcase, CalendarCheck, MessageSquare } from "lucide-react";
import api from "../api/axios";

export default function NotificationCenter() {
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState([]);
  const panelRef          = useRef(null);

  useEffect(() => {
    api.get("/analytics").then((r) => {
      const notes = [];
      const d = r.data;
      if (d.thisWeekApps > 0)
        notes.push({ icon: Briefcase,     text: `${d.thisWeekApps} application${d.thisWeekApps > 1 ? "s" : ""} this week`, color: "#2563EB" });
      if (d.interviews > 0)
        notes.push({ icon: CalendarCheck, text: `${d.interviews} active interview${d.interviews > 1 ? "s" : ""}`, color: "#C2410C" });
      const unprepared = d.totalQs - d.preparedQs;
      if (unprepared > 0)
        notes.push({ icon: MessageSquare, text: `${unprepared} interview question${unprepared > 1 ? "s" : ""} not prepared`, color: "var(--color-primary)" });
      if (d.streak > 0)
        notes.push({ icon: Briefcase, text: `🔥 ${d.streak}-day activity streak`, color: "#16A34A" });
      setItems(notes);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && panelRef.current) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: -8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power3.out" }
      );
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (open && !e.target.closest("[data-notif]")) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" data-notif>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-black/5"
        style={{ color: "var(--color-muted)" }}
        aria-label="Notifications"
      >
        <Bell size={15} />
        {items.length > 0 && (
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--color-danger)" }}
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-10 w-72 rounded-lg overflow-hidden z-40"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <p className="text-xs font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Notifications</p>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--color-muted)" }}>All caught up!</p>
          ) : (
            <div className="py-1">
              {items.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#F5F3F0" }}>
                      <Icon size={12} style={{ color: n.color }} />
                    </div>
                    <p className="text-xs leading-snug">{n.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
