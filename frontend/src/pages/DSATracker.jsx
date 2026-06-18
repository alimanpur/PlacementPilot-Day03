import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { toast } from "sonner";
import { Plus, Check, Trash2, Code2, ExternalLink } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import api from "../api/axios";
import {
  Button, Input, Select, Modal, Badge,
  PageHeader, Card, EmptyState, Skeleton,
} from "../components/ui/index.jsx";
import { DSAIllustration } from "../components/EmptyIllustrations.jsx";

const TOPICS      = ["Arrays","Strings","Linked List","Trees","Graphs","DP","Sorting","Binary Search","Stack/Queue","Greedy","Backtracking","Hashing"];
const DIFFICULTIES= ["Easy","Medium","Hard"];
const DIFF_COLORS = { Easy: "#16A34A", Medium: "#C2410C", Hard: "#DC2626" };

/* ── Animated progress bar ───────────────────────── */
function ProgressBar({ label, solved, total }) {
  const pct    = total > 0 ? (solved / total) * 100 : 0;
  const fillRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      fillRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 0.9, ease: "power3.out", delay: 0.05 }
    );
  }, [pct]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[11px]" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
          {solved}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EDEA" }}>
        <div ref={fillRef} className="h-full rounded-full" style={{ background: "var(--color-primary)", width: "0%" }} />
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────── */
function DSASkeleton() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-7">
        <div><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-40" /></div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-5 rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-4 w-32 mb-5" />
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1.5"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-8" /></div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
        <div className="col-span-7 rounded-lg p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-4 w-40 mb-5" />
          <Skeleton className="h-[180px] w-full" />
        </div>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Custom chart tooltip ─────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-3 py-2 text-xs" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontFamily: "var(--font-body)" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.fill }}>{p.name}: <span className="font-semibold">{p.value}</span></p>)}
    </div>
  );
}

/* ── DSA Tracker ──────────────────────────────────── */
export default function DSATracker() {
  const [problems,    setProblems]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [topicFilter, setTopicFilter] = useState("");
  const [diffFilter,  setDiffFilter]  = useState("");
  const listRef = useRef(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (loading || !listRef.current) return;
    gsap.from(listRef.current.querySelectorAll(".prob-row"), {
      opacity: 0, x: -8, duration: 0.28, stagger: 0.04, ease: "power2.out", clearProps: "all",
    });
  }, [loading, problems.length]);

  async function fetchAll() {
    try {
      const [pRes, sRes] = await Promise.all([api.get("/dsa"), api.get("/dsa/stats")]);
      setProblems(pRes.data);
      setStats(sRes.data);
    } catch { toast.error("Failed to load DSA data"); }
    finally { setLoading(false); }
  }

  async function handleToggle(id) {
    try {
      const res = await api.patch(`/dsa/${id}/toggle`);
      setProblems((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      const sRes = await api.get("/dsa/stats");
      setStats(sRes.data);
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this problem?")) return;
    try {
      await api.delete(`/dsa/${id}`);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      const sRes = await api.get("/dsa/stats");
      setStats(sRes.data);
    } catch { toast.error("Failed to delete"); }
  }

  async function onSubmit(data) {
    try {
      const res = await api.post("/dsa", data);
      setProblems((prev) => [res.data, ...prev]);
      const sRes = await api.get("/dsa/stats");
      setStats(sRes.data);
      toast.success("Problem added");
      reset();
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  }

  const filtered = problems.filter((p) => {
    if (topicFilter && p.topic      !== topicFilter) return false;
    if (diffFilter  && p.difficulty !== diffFilter)  return false;
    return true;
  });

  const diffChartData = DIFFICULTIES.map((d) => ({
    name: d,
    Total:  stats?.byDifficulty[d]?.total  || 0,
    Solved: stats?.byDifficulty[d]?.solved || 0,
  }));

  if (loading) return <DSASkeleton />;

  const totalSolved = stats?.solved || 0;
  const totalProbs  = stats?.total  || 0;
  const pct = totalProbs > 0 ? Math.round((totalSolved / totalProbs) * 100) : 0;

  return (
    <div className="p-8">
      <PageHeader
        title="DSA Tracker"
        subtitle={`${totalSolved} / ${totalProbs} problems solved · ${pct}% complete`}
        action={
          <Button onClick={() => { reset(); setModalOpen(true); }}>
            <Plus size={14} />Add Problem
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-5 mb-6">
        {/* Topic progress */}
        <Card className="col-span-5">
          <h3 className="text-sm font-semibold mb-5" style={{ fontFamily: "var(--font-sans)" }}>
            Topic Progress
          </h3>
          {Object.keys(stats?.byTopic || {}).length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(stats.byTopic).map(([topic, { solved, total }]) => (
                <ProgressBar key={topic} label={topic} solved={solved} total={total} />
              ))}
            </div>
          ) : (
            <p className="text-xs py-4 text-center" style={{ color: "var(--color-muted)" }}>
              Add problems to see topic breakdown
            </p>
          )}
        </Card>

        {/* Difficulty chart */}
        <Card className="col-span-7">
          <h3 className="text-sm font-semibold mb-5" style={{ fontFamily: "var(--font-sans)" }}>
            Difficulty Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={diffChartData} barGap={3} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="2 4" stroke="#EEEBE7" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--color-muted)", fontFamily: "var(--font-body)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                axisLine={false} tickLine={false} allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="Total" radius={[3,3,0,0]} name="Total">
                {DIFFICULTIES.map((d) => <Cell key={d} fill={`${DIFF_COLORS[d]}28`} />)}
              </Bar>
              <Bar dataKey="Solved" radius={[3,3,0,0]} name="Solved">
                {DIFFICULTIES.map((d) => <Cell key={d} fill={DIFF_COLORS[d]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {[
          { val: topicFilter, set: setTopicFilter, placeholder: "All Topics",       opts: TOPICS },
          { val: diffFilter,  set: setDiffFilter,  placeholder: "All Difficulties", opts: DIFFICULTIES },
        ].map(({ val, set, placeholder, opts }) => (
          <select
            key={placeholder}
            className="px-3 py-2 text-sm rounded-md outline-none"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
            value={val}
            onChange={(e) => set(e.target.value)}
            aria-label={placeholder}
          >
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        {(topicFilter || diffFilter) && (
          <button
            onClick={() => { setTopicFilter(""); setDiffFilter(""); }}
            className="text-xs px-2.5 py-1.5 rounded-md transition-colors"
            style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)", background: "transparent" }}
          >
            Clear filters
          </button>
        )}
        <p className="ml-auto text-xs" style={{ color: "var(--color-muted)" }}>
          {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Problem list */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            svg={DSAIllustration}
            icon={Code2}
            title={topicFilter || diffFilter ? "No matching problems" : "No problems yet"}
            description={
              topicFilter || diffFilter
                ? "Try clearing your filters."
                : "Start adding DSA problems to track your solving progress."
            }
            action={
              !topicFilter && !diffFilter ? (
                <Button size="sm" onClick={() => { reset(); setModalOpen(true); }}>
                  <Plus size={13} />Add Problem
                </Button>
              ) : null
            }
          />
        ) : (
          <div ref={listRef}>
            {filtered.map((problem) => (
              <div
                key={problem.id}
                className="prob-row flex items-center gap-3 px-4 py-3 group transition-colors"
                style={{ borderBottom: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.018)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(problem.id)}
                  className="check-box w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{
                    border: `1.5px solid ${problem.solved ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: problem.solved ? "var(--color-primary)" : "transparent",
                  }}
                  aria-label={problem.solved ? "Mark unsolved" : "Mark solved"}
                  aria-checked={problem.solved}
                  role="checkbox"
                >
                  {problem.solved && <Check size={10} color="#fff" strokeWidth={3} />}
                </button>

                {/* Title */}
                <span
                  className="text-sm flex-1 min-w-0 truncate"
                  style={{
                    color:          problem.solved ? "var(--color-muted)" : "var(--color-text)",
                    textDecoration: problem.solved ? "line-through" : "none",
                  }}
                >
                  {problem.title}
                </span>

                {/* Topic tag */}
                <span
                  className="text-[11px] px-2 py-0.5 rounded shrink-0"
                  style={{ background: "#F5F3F0", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {problem.topic}
                </span>

                <Badge label={problem.difficulty} />

                {problem.link && (
                  <a
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded transition-colors"
                    style={{ color: "var(--color-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
                    aria-label={`Open ${problem.title} on LeetCode`}
                  >
                    <ExternalLink size={13} />
                  </a>
                )}

                <button
                  onClick={() => handleDelete(problem.id)}
                  className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: "var(--color-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
                  aria-label={`Delete ${problem.title}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Problem">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Problem Title *"
            placeholder="Two Sum"
            autoFocus
            error={errors.title?.message}
            {...register("title", { required: "Required" })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Topic *" error={errors.topic?.message} {...register("topic", { required: "Required" })}>
              <option value="">Select…</option>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Difficulty *" error={errors.difficulty?.message} {...register("difficulty", { required: "Required" })}>
              <option value="">Select…</option>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </div>
          <Input label="Problem Link" type="url" placeholder="https://leetcode.com/problems/…" {...register("link")} />
          <div className="flex justify-end gap-2 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding…" : "Add Problem"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
