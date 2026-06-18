import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, Briefcase, Code2, MessageSquare,
  BarChart3, LogOut, Rocket, Search, Settings,
  Menu, Brain, Sun, Moon, Monitor,
} from "lucide-react";

const NAV = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/applications", icon: Briefcase,       label: "Applications"  },
  { to: "/dsa",          icon: Code2,           label: "DSA Tracker"   },
  { to: "/interview",    icon: MessageSquare,   label: "Interview Prep"},
  { to: "/ai-coach",     icon: Brain,           label: "AI Coach"      },
  { to: "/analytics",    icon: BarChart3,       label: "Analytics"     },
  { to: "/settings",     icon: Settings,        label: "Settings"      },
];

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const cycle = { light: "dark", dark: "system", system: "light" };
  const Icon = THEME_ICONS[theme];
  return (
    <button
      onClick={() => setTheme(cycle[theme])}
      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
      aria-label={`Theme: ${theme}. Click to switch`}
      title={`Current: ${theme}`}
      style={{ color: "var(--color-sidebar-muted)" }}
    >
      <Icon size={13} />
    </button>
  );
}

function SidebarContent({ user, onLogout, onSearchOpen, closeMenu }) {
  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--color-sidebar-border)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <Rocket size={18} color="#fff" aria-hidden="true" />
        </div>
        <span className="text-[18px] font-bold tracking-tight" style={{ color: "var(--color-sidebar-text)" }}>
          PlacementPilot
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={closeMenu}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-[8px] rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "hover:bg-white/[0.05]"
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? "var(--color-sidebar-text)" : "var(--color-sidebar-muted)",
              background: isActive ? "rgba(255,255,255,0.09)" : "transparent",
            })}
            aria-current={({ isActive }) => isActive ? "page" : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: "var(--color-primary)" }}
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={15}
                  color={isActive ? "var(--color-primary)" : "currentColor"}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  aria-hidden="true"
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div
        className="px-2.5 pb-4 pt-2 shrink-0"
        style={{ borderTop: "1px solid var(--color-sidebar-border)" }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "var(--color-primary)", color: "#fff" }}
            aria-hidden="true"
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: "var(--color-sidebar-text)" }}>
              {user?.name}
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--color-sidebar-muted)" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-1 rounded transition-colors hover:text-white"
            style={{ color: "var(--color-sidebar-muted)" }}
            aria-label="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Route progress bar ─────────────────────────── */
function RouteProgress() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    setVisible(true);
    if (barRef.current) {
      gsap.fromTo(barRef.current, { width: "0%" }, {
        width: "85%", duration: 0.4, ease: "power2.out",
        onComplete: () => {
          gsap.to(barRef.current, {
            width: "100%", duration: 0.2, ease: "power2.in",
            onComplete: () => setVisible(false),
          });
        },
      });
    }
  }, [location.pathname]);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px]" style={{ background: "transparent" }}>
      <div ref={barRef} className="h-full" style={{ background: "var(--color-primary)" }} />
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [cmdOpen, setCmdOpen]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef  = useRef(null);
  const sideRef  = useRef(null);

  useEffect(() => {
    if (sideRef.current) {
      gsap.from(sideRef.current, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    }
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  function handleLogout() { logout(); navigate("/login"); }

  const [CommandPalette, setCommandPalette] = useState(null);
  useEffect(() => {
    import("./CommandPalette.jsx").then((m) => setCommandPalette(() => m.default)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <RouteProgress />

      {/* Desktop sidebar */}
      <aside
        ref={sideRef}
        className="sidebar hidden md:flex flex-col w-[220px] shrink-0 h-screen"
        aria-label="Main navigation"
      >
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          onSearchOpen={() => setCmdOpen(true)}
          closeMenu={() => {}}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} aria-hidden="true" />
          <aside
            className="sidebar relative flex flex-col w-64 h-full z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              user={user}
              onLogout={handleLogout}
              onSearchOpen={() => { setCmdOpen(true); setMobileOpen(false); }}
              closeMenu={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="topbar" role="banner">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-black/5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={16} style={{ color: "var(--color-muted)" }} />
          </button>

          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 flex-1 max-w-sm px-3 py-1.5 rounded-lg text-[13px] transition-colors hover:bg-black/[0.03]"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-muted)",
            }}
            aria-label="Open search (Ctrl+K)"
            tabIndex={0}
          >
            <Search size={13} aria-hidden="true" />
            <span className="flex-1 text-left">Search everything…</span>
            <kbd
              className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "var(--kbd-bg)", fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
              aria-label="Keyboard shortcut: Control K"
            >
              ⌘K
            </kbd>
          </button>
        </header>

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--color-bg)" }}
          id="main-content"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {CommandPalette && <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
