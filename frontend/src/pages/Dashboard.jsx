import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Briefcase, CalendarCheck, Trophy, Target,
  TrendingUp, Clock, Flame, Star, Zap,
  Plus, Code2, MessageSquare, Brain, Sparkles,
  Rocket, CheckCircle2, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Card, Skeleton, SkeletonCard, Button } from "../components/ui/index.jsx";

const QUICK_ACTIONS = [
  { label: "Add Application", icon: Briefcase, color: "#2563EB", bg: "#EFF6FF", route: "/applications" },
  { label: "Add DSA Problem", icon: Code2, color: "#234E52", bg: "rgba(35,78,82,0.1)", route: "/dsa" },
  { label: "Add Interview Q", icon: MessageSquare, color: "#C2410C", bg: "#FFF7ED", route: "/interview" },
  { label: "Open AI Coach", icon: Brain, color: "#7C3AED", bg: "#F5F3FF", route: "/ai-coach" },
];

const WINS = [
  "Completed 10 DSA Questions",
  "Applied to Stripe",
  "Reached 7 Day Streak",
  "Solved First Hard Problem",
  "Got Interview Callback",
  "Completed System Design Module",
];

function ActivityTimeline({ items }) {
  if (!items?.length) return null;
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "var(--color-border)" }} aria-hidden="true" />
      <div className="flex flex-col gap-4">
        {items.slice(0, 5).map((item, i) => {
          const icons = { dsa: Code2, application: Briefcase, interview: MessageSquare, achievement: Trophy };
          const Icon = icons[item.type] || Clock;
          return (
            <div key={i} className="relative flex items-start gap-3">
              <div className="absolute -left-6 w-[15px] h-[15px] rounded-full flex items-center justify-center" style={{ background: "var(--color-surface)", border: "2px solid var(--color-primary)" }} aria-hidden="true">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-primary)" }} />
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.type === "dsa" ? "rgba(35,78,82,0.1)" : item.type === "application" ? "#EFF6FF" : item.type === "interview" ? "#FFF7ED" : "#F5F3FF" }}>
                <Icon size={13} style={{ color: item.type === "dsa" ? "var(--color-primary)" : "#2563EB" }} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug">{item.text}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
                  {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Counter({ target, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.4, ease: "power3.out",
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.v); },
    });
  }, [target]);
  return <span ref={ref} className={className}>0</span>;
}

function ReadinessRing({ score }) {
  const r = 50, c = 2 * Math.PI * r;
  const circleRef = useRef(null), numRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(circleRef.current, { strokeDashoffset: c }, { strokeDashoffset: c - (score / 100) * c, duration: 1.6, ease: "power3.out" });
    const obj = { v: 0 };
    gsap.to(obj, { v: score, duration: 1.5, ease: "power3.out", onUpdate: () => { if (numRef.current) numRef.current.textContent = Math.round(obj.v); } });
  }, [score, c]);
  const label = score >= 80 ? "Excellent" : score >= 60 ? "On track" : score >= 40 ? "Building" : "Keep going";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
          <circle ref={circleRef} cx="60" cy="60" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c} />
        </svg>
        <div className="absolute text-center">
          <p ref={numRef} className="text-2xl font-bold" style={{ fontFamily: "var(--font-sans)", color: "var(--color-primary)" }}>0</p>
          <p className="text-[10px] font-medium" style={{ color: "var(--color-muted)" }}>/100</p>
        </div>
      </div>
      <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{label}</p>
    </div>
  );
}

const Heatmap = React.memo(function Heatmap({ apps, dsa }) {
  const today = new Date();
  const cells = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const appCount = apps.filter((a) => a.createdAt?.split("T")[0] === key).length;
    const dsaCount = dsa.filter((p) => p.solvedAt?.split("T")[0] === key).length;
    const total = appCount + dsaCount;
    let bg = "var(--color-border)";
    if (total >= 5) bg = "var(--color-primary)";
    else if (total >= 3) bg = "#4A8F7C";
    else if (total >= 1) bg = "#A8CFCA";
    cells.push({ key, total, bg, d });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.total} activit${cell.total === 1 ? "y" : "ies"}`}
                className="w-[11px] h-[11px] rounded-[2px] transition-transform hover:scale-125"
                style={{ background: cell.bg }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2 items-center">
        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>Less</span>
        {["var(--color-border)", "#A8CFCA", "#4A8F7C", "var(--color-primary)"].map((bg, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: bg }} />
        ))}
        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>More</span>
      </div>
    </div>
  );
});

function Badge({ label, desc, unlocked }) {
  return (
    <div
      className="flex items-center gap-2.5 p-2.5 rounded-lg"
      style={{
        background: unlocked ? "rgba(35,78,82,0.06)" : "var(--color-surface-2)",
        border: `1px solid ${unlocked ? "rgba(35,78,82,0.18)" : "var(--color-border)"}`,
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
        style={{ background: unlocked ? "var(--color-primary)" : "var(--color-border)" }}
      >
        <Star size={12} color={unlocked ? "#fff" : "var(--color-muted)"} strokeWidth={unlocked ? 2.5 : 1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: unlocked ? "var(--color-text)" : "var(--color-muted)" }}>{label}</p>
        <p className="text-[10px] truncate" style={{ color: "var(--color-muted)" }}>{desc}</p>
      </div>
    </div>
  );
}

function GoalBar({ label, current, target, unit }) {
  const pct = Math.min((current / target) * 100, 100);
  const fillRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(fillRef.current, { width: "0%" }, { width: `${pct}%`, duration: 1, ease: "power3.out", delay: 0.2 });
  }, [pct]);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[11px]" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
        <div ref={fillRef} className="h-full rounded-full" style={{ background: "var(--color-primary)", width: "0%" }} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-5 md:p-8">
      <div className="mb-7"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-56" /></div>
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="col-span-12 md:col-span-3 rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-3 w-24 mx-auto mb-4" /><Skeleton className="w-[120px] h-[120px] rounded-full mx-auto mb-3" /><Skeleton className="h-3 w-20 mx-auto" />
        </div>
        <div className="col-span-12 md:col-span-9 grid grid-cols-2 gap-4">
          {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2 text-xs" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontFamily: "var(--font-body)" }}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}</span></p>)}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [apps, setApps] = useState([]);
  const [dsa, setDsa] = useState([]);
  const containerRef = useRef(null);
  const [randomWin] = useState(() => WINS[Math.floor(Math.random() * WINS.length)]);

  useEffect(() => {
    Promise.all([api.get("/analytics"), api.get("/applications"), api.get("/dsa")])
      .then(([aRes, appRes, dsaRes]) => {
        setData(aRes.data);
        setApps(appRes.data);
        setDsa(dsaRes.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      gsap.from(".dash-stat",      { y: 18, opacity: 0, duration: 0.45, stagger: 0.07, ease: "power2.out" });
      gsap.from(".dash-readiness", { y: 18, opacity: 0, duration: 0.45, delay: 0.05,  ease: "power2.out" });
      gsap.from(".dash-chart",     { y: 22, opacity: 0, duration: 0.5,  delay: 0.3, stagger: 0.08, ease: "power2.out" });
      gsap.from(".dash-badge",     { scale: 0.9, opacity: 0, duration: 0.35, delay: 0.5, stagger: 0.06, ease: "back.out(1.5)" });
      gsap.from(".dash-quick",     { y: 12, opacity: 0, duration: 0.35, delay: 0.15, stagger: 0.05, ease: "power2.out" });
      gsap.from(".dash-win",       { x: -10, opacity: 0, duration: 0.4, delay: 0.3, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  if (!data) return <DashboardSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Applications", value: data.totalApps,  icon: Briefcase,     color: "#2563EB", bg: "#EFF6FF" },
    { label: "Interviews",   value: data.interviews,  icon: CalendarCheck, color: "#C2410C", bg: "#FFF7ED" },
    { label: "Offers",       value: data.offers,      icon: Trophy,        color: "#16A34A", bg: "#F0FDF4" },
    { label: "DSA Solved",   value: data.dsaSolved,   icon: Target,        color: "var(--color-primary)", bg: "rgba(35,78,82,0.1)" },
  ];

  return (
    <div className="p-5 md:p-8" ref={containerRef}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
            {greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Here's your placement overview</p>
        </div>
        <div className="flex items-center gap-2">
          {data.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(194,65,12,0.1)", color: "#C2410C", border: "1px solid rgba(194,65,12,0.2)" }}>
              <Flame size={12} />
              {data.streak}d streak
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(35,78,82,0.1)", color: "var(--color-primary)", border: "1px solid rgba(35,78,82,0.15)" }}>
            <Zap size={12} />
            {data.thisWeekApps} this week
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="dash-quick mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Rocket size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
          <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="dash-quick flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ background: action.bg, border: `1px solid ${action.bg}` }}
              aria-label={action.label}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: action.color }}>
                <action.icon size={18} color="#fff" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold text-center leading-tight" style={{ color: action.color }}>{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Top row */}
      <div className="grid grid-cols-12 gap-4 md:gap-5 mb-5">
        <Card className="col-span-12 md:col-span-3 dash-readiness flex flex-col items-center justify-center gap-1 py-6">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--color-muted)", letterSpacing: "0.06em" }}>Readiness</p>
          <ReadinessRing score={data.readiness} />
          <div className="mt-3 text-center">
            <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>Offer Probability</p>
            <p className="text-lg font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-sans)" }}>
              {data.offerProbability}%
            </p>
          </div>
        </Card>

        <div className="col-span-12 md:col-span-9 grid grid-cols-2 gap-3 md:gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="dash-stat card-hover" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium mb-2.5" style={{ color: "var(--color-muted)" }}>{s.label}</p>
                  <p className="text-[32px] font-bold leading-none" style={{ fontFamily: "var(--font-sans)", color: "var(--color-text)" }}>
                    <Counter target={s.value} />
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon size={16} color={s.color} strokeWidth={1.8} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Goals */}
      <Card className="dash-chart mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
          <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Goal Progress</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {(data.goals || []).map((g) => (
            <GoalBar key={g.label} label={g.label} current={g.current} target={g.target} unit={g.unit} />
          ))}
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-12 gap-4 md:gap-5 mb-5">
        <Card className="col-span-12 md:col-span-8 dash-chart">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Weekly Activity</h2>
            <div className="flex items-center gap-4 ml-auto">
              {[{ color: "#2563EB", label: "Applications" }, { color: "var(--color-primary)", label: "DSA" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gDsa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#234E52" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#234E52" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="applications" stroke="#2563EB" fill="url(#gApps)" strokeWidth={1.8} name="Applications" dot={false} activeDot={{ r: 3 }} />
              <Area type="monotone" dataKey="dsa"          stroke="var(--color-primary)" fill="url(#gDsa)" strokeWidth={1.8} name="DSA" dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-12 md:col-span-4 dash-chart">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Activity Timeline</h2>
          </div>
          {data.recent?.length > 0 ? (
            <ActivityTimeline items={data.recent} />
          ) : (
            <p className="text-xs text-center py-8" style={{ color: "var(--color-muted)" }}>No activity yet.</p>
          )}
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="dash-chart mb-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
          <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Activity Heatmap</h2>
          <span className="ml-auto text-xs" style={{ color: "var(--color-muted)" }}>Last 12 months</span>
        </div>
        <Heatmap apps={apps} dsa={dsa} />
      </Card>

      {/* Weekly wins + Achievements */}
      <div className="grid grid-cols-12 gap-4 md:gap-5">
        <Card className="col-span-12 md:col-span-5 dash-chart">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Recent Wins</h2>
          </div>
          <div className="dash-win flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: "rgba(35,78,82,0.06)", border: "1px solid rgba(35,78,82,0.15)" }}>
            <CheckCircle2 size={16} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
            <p className="text-xs font-medium">{randomWin}</p>
          </div>
          <div className="flex flex-col gap-3">
            {data.bestTopic && (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--color-surface-2)" }}>
                <p className="text-xs">Best DSA Topic</p>
                <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{data.bestTopic}</p>
              </div>
            )}
            {data.topRole && (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--color-surface-2)" }}>
                <p className="text-xs">Most Applied Role</p>
                <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{data.topRole}</p>
              </div>
            )}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--color-surface-2)" }}>
              <p className="text-xs">Offer Probability</p>
              <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{data.offerProbability}%</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--color-surface-2)" }}>
              <p className="text-xs">Current Streak</p>
              <p className="text-xs font-semibold" style={{ color: "#C2410C" }}>🔥 {data.streak} day{data.streak !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 md:col-span-7 dash-chart">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
            <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Achievements</h2>
            <span className="ml-auto text-xs" style={{ color: "var(--color-muted)" }}>
              {(data.achievements || []).filter((a) => a.unlocked).length}/{(data.achievements || []).length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(data.achievements || []).map((a) => (
              <div key={a.id} className="dash-badge">
                <Badge label={a.label} desc={a.desc} unlocked={a.unlocked} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}