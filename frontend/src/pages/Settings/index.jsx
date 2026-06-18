import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/axios";
import { Card, PageHeader, Button, Input, Divider } from "../../components/ui/index.jsx";
import { User, RefreshCw, Shield, Sun, Moon, Monitor } from "lucide-react";

function Section({ title, icon: Icon, children }) {
  return (
    <Card className="mb-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-surface-2)" }}>
          <Icon size={14} style={{ color: "var(--color-primary)" }} strokeWidth={2} />
        </div>
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

const THEMES = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [resetting, setResetting] = useState(false);

  async function handleResetDemo() {
    if (!confirm("Reset all data and reload the demo dataset? This cannot be undone.")) return;
    setResetting(true);
    try {
      await api.post("/auth/reset-demo");
      toast.success("Demo data reset! Refreshing…");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  return (
    <div className="page-pad max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <Section title="Profile" icon={User}>
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Input label="Full Name" defaultValue={user?.name} disabled hint="Contact support to change name" />
          <Input label="Email" defaultValue={user?.email} disabled hint="Email cannot be changed" />
        </div>
        <Divider className="my-4" />
        <Button variant="danger" size="sm" onClick={handleLogout}>Sign out of all sessions</Button>
      </Section>

      <Section title="Appearance" icon={Sun}>
        <p className="text-[13px] mb-4" style={{ color: "var(--color-muted)" }}>
          Choose how PlacementPilot looks. System mode follows your OS preference.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all btn-press"
              style={{
                border: `2px solid ${theme === value ? "var(--color-primary)" : "var(--color-border)"}`,
                background: theme === value ? "rgba(35,78,82,0.08)" : "var(--color-surface-2)",
                color: theme === value ? "var(--color-primary)" : "var(--color-muted)",
              }}
              aria-pressed={theme === value}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Demo Data" icon={RefreshCw}>
        <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
          Reset your account to the original demo state: 12 applications, 68 DSA problems, and 35 interview questions.
        </p>
        <Button variant="outline" onClick={handleResetDemo} disabled={resetting}>
          {resetting
            ? <><RefreshCw size={13} className="animate-spin" /> Resetting…</>
            : <><RefreshCw size={13} /> Reset Demo Data</>
          }
        </Button>
      </Section>

      <Section title="Security" icon={Shield}>
        <div
          className="flex items-start gap-3 p-3 rounded-lg"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "#16A34A" }} />
          <div>
            <p className="text-sm font-semibold">JWT Authentication Active</p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--color-muted)" }}>
              Your session is secured with a 7-day JWT token stored in localStorage.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
