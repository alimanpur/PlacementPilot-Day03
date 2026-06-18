import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import api from "../api/axios";
import { Card, PageHeader, Skeleton, SkeletonCard, EmptyState } from "../components/ui/index.jsx";
import { AnalyticsIllustration } from "../components/EmptyIllustrations.jsx";

const STATUS_COLORS = {
  Applied:   "#2563EB",
  Interview: "#C2410C",
  Offer:     "#16A34A",
  Rejected:  "#DC2626",
  Withdrawn: "#6B7280",
};

/* ── Count-up stat card ─────────────────────────── */
function StatCard({ label, value, sub, className = "" }) {
  const numRef = useRef(null);
  useEffect(() => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value, duration: 1.3, ease: "power3.out",
      onUpdate: () => { if (numRef.current) numRef.current.textContent = Math.round(obj.v); },
    });
  }, [value]);
  return (
    <Card hover className={`card-hover ${className}`}>
      <p className="text-xs font-medium mb-2.5" style={{ color: "var(--color-muted)" }}>{label}</p>
      <p className="text-[32px] font-bold leading-none" style={{ fontFamily: "var(--font-sans)" }}>
        <span ref={numRef}>0</span>
      </p>
      {sub && <p className="text-xs mt-1.5" style={{ color: "var(--color-muted)" }}>{sub}</p>}
    </Card>
  );
}

/* ── Custom tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2 text-xs" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontFamily: "var(--font-body)" }}>
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Analytics skeleton ─────────────────────────── */
function AnalyticsSkeleton() {
  return (
    <div className="p-8">
      <div className="mb-7"><Skeleton className="h-6 w-28 mb-2" /><Skeleton className="h-4 w-48" /></div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="col-span-8 rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-4 w-36 mb-5" /><Skeleton className="h-52 w-full" />
        </div>
        <div className="col-span-4 rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-4 w-32 mb-5" /><Skeleton className="h-52 w-full rounded-full mx-auto" style={{ maxWidth: 160 }} />
        </div>
      </div>
      <div className="rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <Skeleton className="h-4 w-48 mb-5" /><Skeleton className="h-44 w-full" />
      </div>
    </div>
  );
}

/* ── Analytics ──────────────────────────────────── */
export default function Analytics() {
  const [data,         setData]     = useState(null);
  const [apps,         setApps]     = useState([]);
  const containerRef                = useRef(null);

  useEffect(() => {
    Promise.all([api.get("/analytics"), api.get("/applications")])
      .then(([aRes, appRes]) => { setData(aRes.data); setApps(appRes.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      gsap.from(".ana-stat", { y: 16, opacity: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" });
      gsap.from(".ana-chart", { y: 20, opacity: 0, duration: 0.45, delay: 0.28, stagger: 0.08, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  if (!data) return <AnalyticsSkeleton />;

  const statusDist = Object.entries(
    apps.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const readinessBars = [
    { name: "Applications", score: Math.round(Math.min(data.totalApps / 20, 1) * 25), max: 25 },
    { name: "DSA",          score: data.totalDsa > 0 ? Math.round((data.dsaSolved / data.totalDsa) * 35) : 0, max: 35 },
    { name: "Interview",    score: data.totalQs > 0  ? Math.round((data.preparedQs / data.totalQs) * 25) : 0, max: 25 },
    { name: "Offers",       score: Math.round(Math.min(data.offers / 2, 1) * 15), max: 15 },
  ];

  return (
    <div className="p-8" ref={containerRef}>
      <PageHeader title="Analytics" subtitle="Your placement progress at a glance" />

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="ana-stat">
          <StatCard label="Readiness Score" value={data.readiness} sub="out of 100" />
        </div>
        <div className="ana-stat">
          <StatCard label="Total Applications" value={data.totalApps} sub={`${data.interviews} interviews`} />
        </div>
        <div className="ana-stat">
          <StatCard label="DSA Solved" value={data.dsaSolved} sub={`of ${data.totalDsa} added`} />
        </div>
        <div className="ana-stat">
          <StatCard label="Questions Prepared" value={data.preparedQs} sub={`of ${data.totalQs} total`} />
        </div>
      </div>

      {/* Weekly + Pie row */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        <Card className="col-span-8 ana-chart">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Weekly Activity</h3>
            <div className="flex items-center gap-4">
              {[{ color: "#2563EB", label: "Applications" }, { color: "var(--color-primary)", label: "DSA" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data.weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gA2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gD2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#234E52" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#234E52" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#EEEBE7" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="applications" stroke="#2563EB" fill="url(#gA2)" strokeWidth={1.8} name="Applications" dot={false} activeDot={{ r: 3 }} />
              <Area type="monotone" dataKey="dsa"          stroke="#234E52" fill="url(#gD2)" strokeWidth={1.8} name="DSA"          dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-4 ana-chart">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-sans)" }}>Application Status</h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%" cy="45%"
                  innerRadius={48} outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusDist.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#9CA3AF"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconSize={7}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-body)", paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
                No applications yet.<br />Start tracking to see your breakdown.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Readiness breakdown */}
      <Card className="ana-chart">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-sans)" }}>
            Readiness Score Breakdown
          </h3>
          <span
            className="text-xs px-2.5 py-1 rounded-md font-medium"
            style={{ background: "#E6F0F0", color: "var(--color-primary)" }}
          >
            {data.readiness} / 100
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={readinessBars} layout="vertical" barSize={12} barGap={4}>
            <CartesianGrid strokeDasharray="2 4" stroke="#EEEBE7" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 35]}
              tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "var(--font-body)" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--color-text)", fontFamily: "var(--font-body)" }}
              axisLine={false} tickLine={false}
              width={90}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="max"   fill="#F0EDEA" radius={[0, 3, 3, 0]} name="Max possible" />
            <Bar dataKey="score" fill="var(--color-primary)" radius={[0, 3, 3, 0]} name="Your score" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
