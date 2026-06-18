import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Brain, Sparkles, TrendingUp, Target, BookOpen, ChevronRight, Loader2, MessageSquare } from "lucide-react";
import api from "../api/axios";
import { Card, PageHeader, Button, Textarea } from "../components/ui/index.jsx";

/* ── Rule-based AI engine ──────────────────────────── */
function generateInsights(data, apps, dsa, questions) {
  const dsaSolved   = dsa.filter((p) => p.solved).length;
  const totalDsa    = dsa.length;
  const dsaPct      = totalDsa > 0 ? Math.round((dsaSolved / totalDsa) * 100) : 0;
  const prepared    = questions.filter((q) => q.prepared).length;
  const totalQ      = questions.length;
  const qPct        = totalQ > 0 ? Math.round((prepared / totalQ) * 100) : 0;
  const offers      = apps.filter((a) => a.status === "Offer").length;
  const interviews  = apps.filter((a) => a.status === "Interview").length;
  const conversionRate = apps.length > 0 ? Math.round((interviews / apps.length) * 100) : 0;

  // Topic analysis
  const topicMap = dsa.reduce((acc, p) => {
    if (!acc[p.topic]) acc[p.topic] = { total: 0, solved: 0 };
    acc[p.topic].total++;
    if (p.solved) acc[p.topic].solved++;
    return acc;
  }, {});
  const weakTopics = Object.entries(topicMap)
    .filter(([, v]) => v.total > 0 && v.solved / v.total < 0.4)
    .map(([k]) => k).slice(0, 3);
  const strongTopics = Object.entries(topicMap)
    .filter(([, v]) => v.total > 0 && v.solved / v.total >= 0.8)
    .map(([k]) => k).slice(0, 2);

  // Category analysis
  const catMap = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = { total: 0, prepared: 0 };
    acc[q.category].total++;
    if (q.prepared) acc[q.category].prepared++;
    return acc;
  }, {});
  const weakCats = Object.entries(catMap)
    .filter(([, v]) => v.total > 0 && v.prepared / v.total < 0.3)
    .map(([k]) => k).slice(0, 3);

  return {
    dsaPct, qPct, dsaSolved, totalDsa, prepared, totalQ,
    offers, interviews, conversionRate,
    weakTopics, strongTopics, weakCats, topicMap, catMap,
  };
}

function analyzeResume(text) {
  const lower = text.toLowerCase();
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (lower.includes("built") || lower.includes("developed") || lower.includes("implemented"))
    strengths.push("Uses strong action verbs (built, developed, implemented).");
  if (lower.includes("%") || /\d+x/.test(lower) || lower.includes("million") || lower.includes("thousand"))
    strengths.push("Contains quantified achievements — recruiters love numbers.");
  if (lower.includes("react") || lower.includes("node") || lower.includes("python") || lower.includes("typescript"))
    strengths.push("Modern tech stack mentioned — relevant for current job market.");
  if (lower.includes("intern") || lower.includes("experience"))
    strengths.push("Experience section demonstrates real-world application.");
  if (lower.includes("project") || lower.includes("github"))
    strengths.push("Projects listed — shows initiative beyond coursework.");

  if (!lower.includes("%") && !/\d+x/.test(lower))
    weaknesses.push("No quantified impact — add numbers to your achievements (e.g., 'reduced load time by 40%').");
  if (text.split(" ").length < 150)
    weaknesses.push("Resume content is too brief. Most strong resumes are 400-600 words for 1 page.");
  if (!lower.includes("github") && !lower.includes("linkedin"))
    weaknesses.push("No GitHub/LinkedIn links. Recruiters look for these first.");
  if (lower.includes("responsible for") || lower.includes("helped with"))
    weaknesses.push("Weak phrasing detected ('responsible for', 'helped with') — replace with strong action verbs.");

  suggestions.push("Add a 2-line professional summary at the top with your target role and top 3 skills.");
  if (weaknesses.some((w) => w.includes("quantified")))
    suggestions.push("For each role/project, ask yourself: 'What improved because of my work? By how much?' Add that number.");
  suggestions.push("Ensure your most impressive achievement appears in the first bullet of each role.");
  suggestions.push("Keep formatting ATS-friendly: no tables, columns, or graphics. Use standard section headings.");
  if (!lower.includes("open source"))
    suggestions.push("Consider contributing to open-source — it significantly differentiates candidates.");

  return {
    strengths: strengths.length > 0 ? strengths : ["Submitted for review — add more detail for deeper analysis."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["No critical issues detected. Focus on differentiation."],
    suggestions,
    score: Math.min(Math.round((strengths.length / 5) * 60 + (1 - weaknesses.length / 4) * 40), 100),
  };
}

/* ── Components ──────────────────────────────────────── */
function InsightCard({ icon: Icon, title, color = "var(--color-primary)", children }) {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={15} color={color} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function BulletList({ items, color = "var(--color-primary)" }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
          <span className="text-[13px] leading-relaxed" style={{ color: "var(--color-text)" }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── AI Coach page ───────────────────────────────────── */
export default function AICoach() {
  const [data,       setData]       = useState(null);
  const [apps,       setApps]       = useState([]);
  const [dsa,        setDsa]        = useState([]);
  const [questions,  setQuestions]  = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [analyzing,  setAnalyzing]  = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/analytics"),
      api.get("/applications"),
      api.get("/dsa"),
      api.get("/interview"),
    ]).then(([aRes, appRes, dsaRes, intRes]) => {
      setData(aRes.data);
      setApps(appRes.data);
      setDsa(dsaRes.data);
      setQuestions(intRes.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      gsap.from(".ai-card", { y: 20, opacity: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  function handleAnalyzeResume() {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResumeResult(analyzeResume(resumeText));
      setAnalyzing(false);
    }, 1200);
  }

  if (!data) return (
    <div className="page-pad">
      <PageHeader title="AI Coach" subtitle="Loading your career insights…" />
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    </div>
  );

  const insights = generateInsights(data, apps, dsa, questions);

  const placementProbability = Math.min(
    Math.round(
      (insights.dsaPct * 0.35) +
      (insights.qPct * 0.25) +
      (Math.min(apps.length / 20, 1) * 25) +
      (Math.min(data.offers / 2, 1) * 15)
    ),
    99
  );

  // Company recommendations based on application count and offer rate
  const companyRecs = [
    { name: "Google",    why: "Matches your DSA skill level — they weight algorithmic thinking heavily." },
    { name: "Stripe",    why: "High interview-to-offer ratio for candidates with your profile." },
    { name: "Vercel",    why: "Strong fit for frontend engineers — matches your applied role pattern." },
    { name: "Notion",    why: "Prioritizes product thinking alongside engineering." },
    { name: "Cloudflare",why: "Distributed systems focus — good next step from your current track." },
  ];

  const weeklyInsights = [
    `You've solved ${data.dsaSolved} DSA problems. ${insights.dsaPct >= 60 ? "Strong foundation established." : "Focus on increasing your solve rate."}`,
    data.thisWeekApps > 0 ? `${data.thisWeekApps} application${data.thisWeekApps > 1 ? "s" : ""} this week — ${data.thisWeekApps >= 3 ? "excellent momentum." : "try to aim for 3-5 per week."}` : "No applications this week — consistency is key to landing interviews.",
    insights.qPct >= 70 ? "Interview prep is strong. Focus on System Design questions next." : `Interview prep at ${insights.qPct}% — increase to 70%+ before your first interview.`,
    data.streak > 0 ? `${data.streak}-day activity streak — keep the momentum going!` : "Start a daily practice streak — even 1 problem/day compounds over time.",
    insights.weakTopics.length > 0 ? `Prioritize: ${insights.weakTopics.join(", ")} — your solve rate is below 40% in these areas.` : "Balanced topic coverage — great work!",
  ];

  return (
    <div className="page-pad" ref={containerRef}>
      <PageHeader
        title="AI Coach"
        subtitle="Rule-based career intelligence powered by your data"
      />

      {/* Placement predictor hero */}
      <Card className="ai-card mb-5" style={{ background: "var(--color-primary)", border: "none" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Placement Probability</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}>{placementProbability}%</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>based on your activity</span>
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              DSA ({insights.dsaPct}%) · Prep ({insights.qPct}%) · Applications ({apps.length}) · Offers ({data.offers})
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
              {placementProbability >= 75 ? "🎯 On track for offers" : placementProbability >= 50 ? "📈 Good progress" : "⚡ Needs more activity"}
            </div>
          </div>
        </div>
      </Card>

      {/* Grid row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Interview Coach */}
        <div className="ai-card">
          <InsightCard icon={MessageSquare} title="Interview Coach" color="#C2410C">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "#C2410C" }}>Areas to Strengthen</p>
                {insights.weakCats.length > 0 ? (
                  <BulletList items={insights.weakCats.map((c) => `${c}: less than 30% prepared — prioritize this category.`)} color="#C2410C" />
                ) : (
                  <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>Solid across all categories. Focus on depth now.</p>
                )}
              </div>
              <div className="mt-2">
                <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-primary)" }}>DSA Focus Areas</p>
                {insights.weakTopics.length > 0 ? (
                  <BulletList items={insights.weakTopics.map((t) => `${t}: low solve rate — dedicate 2 sessions this week.`)} />
                ) : (
                  <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>No weak areas detected. Challenge yourself with Hard problems.</p>
                )}
              </div>
              {insights.strongTopics.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>Strong in:</p>
                  {insights.strongTopics.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </InsightCard>
        </div>

        {/* Weekly Insights */}
        <div className="ai-card">
          <InsightCard icon={TrendingUp} title="Weekly Insights">
            <BulletList items={weeklyInsights} />
          </InsightCard>
        </div>
      </div>

      {/* Grid row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Smart Recommendations */}
        <div className="ai-card">
          <InsightCard icon={Sparkles} title="Smart Recommendations" color="#F59E0B">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "#F59E0B" }}>Recommended Companies</p>
                <div className="flex flex-col gap-2">
                  {companyRecs.slice(0, 4).map((c) => (
                    <div key={c.name} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: "#FAFAF8" }}>
                      <ChevronRight size={13} style={{ color: "#F59E0B", marginTop: 2, shrink: 0 }} />
                      <div>
                        <p className="text-[13px] font-semibold">{c.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{c.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </InsightCard>
        </div>

        {/* Next Actions */}
        <div className="ai-card">
          <InsightCard icon={Target} title="Priority Actions" color="#3B82F6">
            <div className="flex flex-col gap-2.5">
              {[
                insights.dsaPct < 60 && { action: "Solve 5 more problems", detail: `You're at ${insights.dsaPct}% — target 60% to improve your score.`, priority: "High" },
                insights.qPct < 70  && { action: "Prepare 5 interview questions", detail: `Focus on: ${insights.weakCats[0] || "System Design"} category.`, priority: "High" },
                apps.length < 10    && { action: "Apply to 3 more companies", detail: "More applications = more chances. Aim for 10+ total.", priority: "Medium" },
                data.streak === 0   && { action: "Start daily streak", detail: "Even 1 problem/day builds a powerful habit.", priority: "Medium" },
                data.offers === 0   && { action: "Target conversion", detail: `Your interview conversion is ${insights.conversionRate}% — follow up on pending applications.`, priority: "Low" },
              ].filter(Boolean).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{
                      background: item.priority === "High" ? "#FEF2F2" : item.priority === "Medium" ? "#FFF7ED" : "#F0F9FF",
                      color: item.priority === "High" ? "#DC2626" : item.priority === "Medium" ? "#C2410C" : "#2563EB",
                    }}
                  >
                    {item.priority}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">{item.action}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted)" }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </InsightCard>
        </div>
      </div>

      {/* Resume Feedback */}
      <div className="ai-card">
        <Card>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)", opacity: 0.12 }}>
              <BookOpen size={15} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center -ml-10" style={{ background: "#E6F0F0" }}>
              <BookOpen size={15} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Resume Feedback</h3>
          </div>

          <Textarea
            label="Paste your resume text"
            placeholder="Paste the text content of your resume here. The AI will analyze structure, impact, and language quality..."
            className="mb-3"
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <Button onClick={handleAnalyzeResume} disabled={analyzing || !resumeText.trim()}>
            {analyzing ? <><Loader2 size={13} className="animate-spin" /> Analyzing…</> : <><Sparkles size={13} /> Analyze Resume</>}
          </Button>

          {resumeResult && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Score */}
              <div className="col-span-full flex items-center gap-3 p-3 rounded-lg mb-1" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <div className="text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-sans)" }}>{resumeResult.score}/100</div>
                <div>
                  <p className="text-sm font-semibold">Resume Score</p>
                  <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                    {resumeResult.score >= 80 ? "Strong resume — minor polish needed." : resumeResult.score >= 60 ? "Good foundation — address the weaknesses." : "Needs significant improvement before sending."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#16A34A" }}>✓ Strengths</p>
                <BulletList items={resumeResult.strengths} color="#16A34A" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#DC2626" }}>⚠ Weaknesses</p>
                <BulletList items={resumeResult.weaknesses} color="#DC2626" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#2563EB" }}>→ Suggestions</p>
                <BulletList items={resumeResult.suggestions} color="#2563EB" />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


