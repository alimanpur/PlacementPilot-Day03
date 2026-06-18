import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Rocket, Copy, CheckCheck, Briefcase, Code2, MessageSquare, Star, Flame } from "lucide-react";
import api from "../api/axios";

/* ── Mini ring ──────────────────────────────────── */
function Ring({ score }) {
  const r = 44, c = 2 * Math.PI * r;
  const ref = useRef(null);
  const numRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { strokeDashoffset: c }, { strokeDashoffset: c - (score / 100) * c, duration: 1.6, ease: "power3.out" });
    const obj = { v: 0 };
    gsap.to(obj, { v: score, duration: 1.5, ease: "power3.out", onUpdate: () => { if (numRef.current) numRef.current.textContent = Math.round(obj.v); } });
  }, [score, c]);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="104" height="104" className="-rotate-90" aria-hidden="true">
        <circle cx="52" cy="52" r={r} fill="none" stroke="#2A2A2A" strokeWidth="6" />
        <circle ref={ref} cx="52" cy="52" r={r} fill="none" stroke="#234E52" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c} />
      </svg>
      <div className="absolute text-center">
        <p ref={numRef} className="text-2xl font-bold text-white" style={{ fontFamily: "inherit" }}>0</p>
        <p className="text-[9px]" style={{ color: "#888" }}>/100</p>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { username } = useParams();
  const [data,    setData]    = useState(null);
  const [copied,  setCopied]  = useState(false);
  const [error,   setError]   = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Portfolio uses the logged-in user's own data (public view of self)
    // In a full implementation you'd have a public endpoint; here we reuse analytics
    api.get("/analytics")
      .then((r) => setData(r.data))
      .catch(() => setError(true));
  }, [username]);

  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      gsap.from(".port-section", { y: 24, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#111" }}>
      <p className="text-white text-lg font-bold mb-2">Profile not found</p>
      <p style={{ color: "#888" }}>This portfolio link may be invalid.</p>
      <Link to="/login" className="mt-6 text-sm underline" style={{ color: "#234E52" }}>Back to PlacementPilot</Link>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "#333", borderTopColor: "#234E52" }} />
    </div>
  );

  const stats = [
    { label: "Applications", value: data.totalApps,  icon: Briefcase  },
    { label: "DSA Solved",   value: data.dsaSolved,   icon: Code2      },
    { label: "Prepared Qs",  value: data.preparedQs,  icon: MessageSquare },
    { label: "Offers",       value: data.offers,       icon: Star       },
  ];

  return (
    <>
      {/* OG meta handled server-side in production; client-side title update */}
      {typeof document !== "undefined" && (document.title = `${username || "My"} Placement Profile — PlacementPilot`)}

      <div ref={containerRef} className="min-h-screen" style={{ background: "#0E0E0E", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />

        {/* Header */}
        <div className="port-section max-w-2xl mx-auto px-5 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#234E52" }}>
              <Rocket size={13} color="#fff" />
            </div>
            <span className="text-sm font-bold" style={{ color: "#888" }}>PlacementPilot</span>
          </div>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "#234E52" }}>
                  {(username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>{username || "My Portfolio"}</h1>
                  <p className="text-sm" style={{ color: "#888" }}>Placement Candidate</p>
                </div>
              </div>
              {data.streak > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold mt-3" style={{ color: "#C2410C" }}>
                  <Flame size={12} /> {data.streak}-day activity streak
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <Ring score={data.readiness} />
              <p className="text-[11px]" style={{ color: "#888" }}>Readiness Score</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="port-section max-w-2xl mx-auto px-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "#161616", border: "1px solid #222" }}>
                <s.icon size={14} style={{ color: "#555", marginBottom: 8 }} strokeWidth={1.5} />
                <p className="text-2xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#888" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly chart */}
        <div className="port-section max-w-2xl mx-auto px-5 mb-6">
          <div className="rounded-xl p-5" style={{ background: "#161616", border: "1px solid #222" }}>
            <p className="text-sm font-bold mb-4">Weekly Activity</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#234E52" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#234E52" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="dsa" stroke="#234E52" fill="url(#pg1)" strokeWidth={2} name="DSA" dot={false} />
                <Area type="monotone" dataKey="applications" stroke="#3B82F6" fill="none" strokeWidth={1.5} name="Apps" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div className="port-section max-w-2xl mx-auto px-5 mb-6">
          <div className="rounded-xl p-5" style={{ background: "#161616", border: "1px solid #222" }}>
            <p className="text-sm font-bold mb-4">Achievements</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(data.achievements || []).map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 p-3 rounded-lg" style={{ background: a.unlocked ? "rgba(35,78,82,0.15)" : "#111", border: `1px solid ${a.unlocked ? "rgba(35,78,82,0.3)" : "#1A1A1A"}`, opacity: a.unlocked ? 1 : 0.35 }}>
                  <Star size={12} color={a.unlocked ? "#234E52" : "#444"} strokeWidth={a.unlocked ? 2.5 : 1.5} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: a.unlocked ? "#fff" : "#666" }}>{a.label}</p>
                    <p className="text-[10px]" style={{ color: "#555" }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="port-section max-w-2xl mx-auto px-5 pb-12">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs" style={{ color: "#555" }}>
              Built with PlacementPilot · Career Operating System
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "#1A1A1A", border: "1px solid #333", color: copied ? "#22C55E" : "#888" }}
              >
                {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <Link to="/login" className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#234E52", color: "#fff" }}>
                Track your journey →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
