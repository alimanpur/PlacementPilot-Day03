import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { toast } from "sonner";
import {
  Plus, Check, Trash2, MessageSquare,
  ChevronDown, ChevronUp, Pencil,
} from "lucide-react";
import api from "../api/axios";
import {
  Button, Input, Select, Textarea, Modal,
  PageHeader, Card, EmptyState, Skeleton,
} from "../components/ui/index.jsx";
import { InterviewIllustration } from "../components/EmptyIllustrations.jsx";

const CATEGORIES = ["Behavioral","System Design","Technical","HR","Coding","Leadership","Other"];

/* ── Question card ──────────────────────────────── */
function QuestionCard({ q, onToggle, onEdit, onDelete, index }) {
  const [expanded, setExpanded] = useState(false);
  const ref        = useRef(null);
  const answerRef  = useRef(null);

  // Staggered entrance driven by parent
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, delay: index * 0.05, ease: "power2.out" }
    );
  }, [index]);

  // Animate answer expand/collapse
  useEffect(() => {
    if (!answerRef.current) return;
    if (expanded) {
      gsap.fromTo(answerRef.current,
        { opacity: 0, height: 0, marginTop: 0 },
        { opacity: 1, height: "auto", marginTop: 8, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(answerRef.current, { opacity: 0, height: 0, marginTop: 0, duration: 0.2, ease: "power2.in" });
    }
  }, [expanded]);

  return (
    <div
      ref={ref}
      className="rounded-lg overflow-hidden card-hover"
      style={{
        border: `1px solid ${q.prepared ? "rgba(35,78,82,0.2)" : "var(--color-border)"}`,
        background: "var(--color-surface)",
        opacity: 0, // GSAP will reveal it
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(q.id)}
          className="check-box w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
          style={{
            border: `1.5px solid ${q.prepared ? "var(--color-primary)" : "var(--color-border)"}`,
            background: q.prepared ? "var(--color-primary)" : "transparent",
          }}
          aria-label={q.prepared ? "Mark as not prepared" : "Mark as prepared"}
          role="checkbox"
          aria-checked={q.prepared}
        >
          {q.prepared && <Check size={10} color="#fff" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-snug"
            style={{
              color:          q.prepared ? "var(--color-muted)" : "var(--color-text)",
              textDecoration: q.prepared ? "line-through" : "none",
            }}
          >
            {q.question}
          </p>
          <span
            className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded"
            style={{ background: "#F5F3F0", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
          >
            {q.category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {q.answer && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded hover:bg-black/5 transition-colors"
              style={{ color: "var(--color-muted)" }}
              aria-label={expanded ? "Collapse answer" : "Expand answer"}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          <button
            onClick={() => onEdit(q)}
            className="p-1.5 rounded hover:bg-black/5 transition-colors"
            style={{ color: "var(--color-muted)" }}
            aria-label="Edit question"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(q.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: "var(--color-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
            aria-label="Delete question"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Answer (animated) */}
      <div ref={answerRef} style={{ height: 0, overflow: "hidden", opacity: 0 }}>
        {q.answer && (
          <div className="px-4 pb-4 ml-8">
            <p
              className="text-xs leading-relaxed p-3 rounded"
              style={{
                background: "#FAFAF8",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                whiteSpace: "pre-wrap",
                border: "1px solid var(--color-border)",
              }}
            >
              {q.answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────── */
function InterviewSkeleton() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-7">
        <div><Skeleton className="h-6 w-36 mb-2" /><Skeleton className="h-4 w-32" /></div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="rounded-lg p-5 mb-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex justify-between mb-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-12" /></div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-3 mb-4"><Skeleton className="h-9 w-40 rounded-md" /><Skeleton className="h-9 w-36 rounded-md" /></div>
      <div className="flex flex-col gap-3">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="rounded-lg p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded shrink-0" />
              <div className="flex-1"><Skeleton className="h-3.5 w-full mb-2" /><Skeleton className="h-3.5 w-3/4 mb-2" /><Skeleton className="h-4 w-20 rounded" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Interview Prep ───────────────────────────────── */
export default function InterviewPrep() {
  const [questions,      setQuestions]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [preparedFilter, setPreparedFilter] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    try {
      const res = await api.get("/interview");
      setQuestions(res.data);
    } catch { toast.error("Failed to load questions"); }
    finally { setLoading(false); }
  }

  function openCreate()  { setEditing(null); reset({}); setModalOpen(true); }
  function openEdit(q)   { setEditing(q); reset(q); setModalOpen(true); }

  async function onSubmit(data) {
    try {
      if (editing) {
        const res = await api.put(`/interview/${editing.id}`, data);
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? res.data : q)));
        toast.success("Question updated");
      } else {
        const res = await api.post("/interview", data);
        setQuestions((prev) => [res.data, ...prev]);
        toast.success("Question added");
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  }

  async function handleToggle(id) {
    try {
      const res = await api.patch(`/interview/${id}/toggle`);
      setQuestions((prev) => prev.map((q) => (q.id === id ? res.data : q)));
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/interview/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch { toast.error("Failed to delete"); }
  }

  const filtered = questions.filter((q) => {
    if (categoryFilter && q.category !== categoryFilter)   return false;
    if (preparedFilter === "true"  && !q.prepared)         return false;
    if (preparedFilter === "false" &&  q.prepared)         return false;
    return true;
  });

  const prepared = questions.filter((q) => q.prepared).length;
  const pct      = questions.length > 0 ? Math.round((prepared / questions.length) * 100) : 0;

  if (loading) return <InterviewSkeleton />;

  return (
    <div className="p-8">
      <PageHeader
        title="Interview Prep"
        subtitle={`${prepared} / ${questions.length} prepared`}
        action={
          <Button onClick={openCreate}><Plus size={14} />Add Question</Button>
        }
      />

      {/* Overall progress bar */}
      {questions.length > 0 && (
        <Card className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Preparation</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EDEA" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "var(--color-primary)" }}
            />
          </div>
          {/* Per-category mini stats */}
          <div className="flex items-center gap-5 mt-3 flex-wrap">
            {CATEGORIES.filter((c) => questions.some((q) => q.category === c)).map((c) => {
              const total = questions.filter((q) => q.category === c).length;
              const done  = questions.filter((q) => q.category === c && q.prepared).length;
              return (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(categoryFilter === c ? "" : c)}
                  className="text-center transition-opacity"
                  style={{ opacity: categoryFilter && categoryFilter !== c ? 0.4 : 1 }}
                >
                  <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{c}</p>
                  <p className="text-sm font-semibold">{done}/{total}</p>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className="px-3 py-2 text-sm rounded-md outline-none"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          className="px-3 py-2 text-sm rounded-md outline-none"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
          value={preparedFilter}
          onChange={(e) => setPreparedFilter(e.target.value)}
          aria-label="Filter by preparation status"
        >
          <option value="">All</option>
          <option value="false">Not Prepared</option>
          <option value="true">Prepared</option>
        </select>
        {(categoryFilter || preparedFilter) && (
          <button
            onClick={() => { setCategoryFilter(""); setPreparedFilter(""); }}
            className="text-xs px-2.5 py-1.5 rounded-md"
            style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
          >
            Clear
          </button>
        )}
        <p className="ml-auto text-xs" style={{ color: "var(--color-muted)" }}>
          {filtered.length} question{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          className="rounded-lg"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <EmptyState
            svg={InterviewIllustration}
            icon={MessageSquare}
            title={categoryFilter || preparedFilter ? "No matching questions" : "No questions yet"}
            description={
              categoryFilter || preparedFilter
                ? "Try adjusting your filters."
                : "Build your question bank. Add common interview questions and track your preparation."
            }
            action={
              !categoryFilter && !preparedFilter ? (
                <Button size="sm" onClick={openCreate}><Plus size={13} />Add Question</Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Question" : "Add Question"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Textarea
            label="Question *"
            placeholder="Tell me about yourself…"
            autoFocus
            error={errors.question?.message}
            {...register("question", { required: "Required" })}
          />
          <Select
            label="Category *"
            error={errors.category?.message}
            {...register("category", { required: "Required" })}
          >
            <option value="">Select…</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Textarea
            label="Answer / Notes"
            placeholder="Your prepared answer…"
            rows={4}
            {...register("answer")}
          />
          <div className="flex justify-end gap-2 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Question"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
