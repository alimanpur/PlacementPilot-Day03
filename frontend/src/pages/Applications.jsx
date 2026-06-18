import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ExternalLink, Briefcase, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";
import {
  Button, Input, Select, Textarea, Modal,
  Badge, PageHeader, EmptyState, Skeleton,
} from "../components/ui/index.jsx";
import { AppsIllustration } from "../components/EmptyIllustrations.jsx";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"];

/* ── Table skeleton ──────────────────────────────── */
function TableSkeleton() {
  return (
    <div>
      {Array(5).fill(null).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Skeleton className="w-7 h-7 rounded shrink-0" />
          <Skeleton className="h-3.5 flex-1 max-w-[140px]" />
          <Skeleton className="h-3 flex-1 max-w-[120px]" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export default function Applications() {
  const [apps,         setApps]         = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const tableRef = useRef(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => { fetchApps(); }, []);

  useEffect(() => {
    let r = apps;
    if (search)       r = r.filter((a) => a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) r = r.filter((a) => a.status === statusFilter);
    setFiltered(r);
  }, [apps, search, statusFilter]);

  // Stagger reveal whenever filtered list changes (and not loading)
  useEffect(() => {
    if (loading || !tableRef.current) return;
    gsap.from(tableRef.current.querySelectorAll("tr.app-row"), {
      opacity: 0, y: 8, duration: 0.3, stagger: 0.04, ease: "power2.out", clearProps: "all",
    });
  }, [filtered, loading]);

  async function fetchApps() {
    try {
      const res = await api.get("/applications");
      setApps(res.data);
    } catch { toast.error("Failed to load applications"); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); reset({ status: "Applied" }); setModalOpen(true); }
  function openEdit(app) {
    setEditing(app);
    reset({ ...app, appliedDate: app.appliedDate?.split("T")[0] });
    setModalOpen(true);
  }

  async function onSubmit(data) {
    try {
      if (editing) {
        const res = await api.put(`/applications/${editing.id}`, data);
        setApps((prev) => prev.map((a) => (a.id === editing.id ? res.data : a)));
        toast.success("Application updated");
      } else {
        const res = await api.post("/applications", data);
        setApps((prev) => [res.data, ...prev]);
        toast.success("Application added");
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Error saving"); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      setApps((prev) => prev.filter((a) => a.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Applications"
        subtitle={loading ? "Loading…" : `${apps.length} total · ${apps.filter((a) => a.status === "Offer").length} offers`}
        action={
          <Button onClick={openCreate} aria-label="Add new application">
            <Plus size={14} />Add Application
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} aria-hidden="true" />
          <input
            aria-label="Search applications"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md outline-none transition-shadow"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(35,78,82,0.12)")}
            onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "var(--color-muted)" }}>
          <SlidersHorizontal size={13} />
        </div>
        <select
          aria-label="Filter by status"
          className="px-3 py-2 text-sm rounded-md outline-none"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Status pill counts */}
        <div className="flex items-center gap-2 ml-auto">
          {STATUSES.filter((s) => apps.some((a) => a.status === s)).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                background: statusFilter === s ? "var(--color-text)" : "var(--color-border)",
                color: statusFilter === s ? "#fff" : "var(--color-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {s} {apps.filter((a) => a.status === s).length}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        role="region"
        aria-label="Applications table"
      >
        {loading ? (
          <>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex gap-6">
                {["Company", "Role", "Status", "Applied", ""].map((h) => (
                  <span key={h} className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{h}</span>
                ))}
              </div>
            </div>
            <TableSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            svg={AppsIllustration}
            icon={Briefcase}
            title={search || statusFilter ? "No matching applications" : "No applications yet"}
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : "Start tracking your job applications. Add your first one to get started."
            }
            action={
              !search && !statusFilter ? (
                <Button onClick={openCreate} size="sm"><Plus size={13} />Add Application</Button>
              ) : null
            }
          />
        ) : (
          <table className="w-full" aria-label="Applications list">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Company", "Role", "Status", "Applied", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
                    scope="col"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="app-row transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: "var(--color-surface-2)", color: "var(--color-text)", fontFamily: "var(--font-sans)" }}
                        aria-hidden="true"
                      >
                        {app.company[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-muted)" }}>
                    {app.role}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={app.status} />
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 justify-end">
                      {app.link && (
                        <a
                          href={app.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-black/5 transition-colors"
                          style={{ color: "var(--color-muted)" }}
                          aria-label={`Open job link for ${app.company}`}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(app)}
                        className="p-1.5 rounded hover:bg-black/5 transition-colors"
                        style={{ color: "var(--color-muted)" }}
                        aria-label={`Edit ${app.company} application`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: "var(--color-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
                        aria-label={`Delete ${app.company} application`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Application" : "New Application"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company *"
              placeholder="Google"
              autoFocus
              error={errors.company?.message}
              {...register("company", { required: "Required" })}
            />
            <Input
              label="Role *"
              placeholder="Software Engineer"
              error={errors.role?.message}
              {...register("role", { required: "Required" })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" {...register("status")}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Applied Date" type="date" {...register("appliedDate")} />
          </div>
          <Input label="Job Link" type="url" placeholder="https://…" {...register("link")} />
          <Textarea label="Notes" placeholder="Any details to remember…" {...register("notes")} />
          <div className="flex justify-end gap-2 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Application"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
