import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import DSATracker from "./pages/DSATracker";
import InterviewPrep from "./pages/InterviewPrep";
import Analytics from "./pages/Analytics";

// Code-split heavy routes
const AICoach   = lazy(() => import("./pages/AICoach"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Settings  = lazy(() => import("./pages/Settings/index.jsx"));

const PAGE_TITLES = {
  "/":             "Dashboard – PlacementPilot",
  "/applications": "Applications – PlacementPilot",
  "/dsa":          "DSA Tracker – PlacementPilot",
  "/interview":    "Interview Prep – PlacementPilot",
  "/ai-coach":     "AI Coach – PlacementPilot",
  "/analytics":    "Analytics – PlacementPilot",
  "/settings":     "Settings – PlacementPilot",
  "/login":        "Sign In – PlacementPilot",
  "/register":     "Create Account – PlacementPilot",
};

function TitleManager() {
  const location = useLocation();
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || "PlacementPilot – Career OS";
    document.title = title;
  }, [location.pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="h-full flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-5 h-5 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
      />
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-5 h-5 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
      />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <TitleManager />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ style: { fontFamily: "Inter, sans-serif", fontSize: 13 } }}
          />
          <Routes>
            <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route
              path="/portfolio/:username"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Portfolio />
                </Suspense>
              }
            />
            <Route path="/" element={<Protected><Layout /></Protected>}>
              <Route index               element={<Dashboard />}    />
              <Route path="applications" element={<Applications />} />
              <Route path="dsa"          element={<DSATracker />}   />
              <Route path="interview"    element={<InterviewPrep />}/>
              <Route path="analytics"    element={<Analytics />}    />
              <Route
                path="ai-coach"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AICoach />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

function NotFound() {
  useEffect(() => { document.title = "404 – PlacementPilot"; }, []);
  const navigate = useNavigate();
  return (
    <div
      className="h-screen flex flex-col items-center justify-center gap-5 text-center px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}
        >
          404
        </div>
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full" style={{ background: "var(--color-danger)" }} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Lost in orbit</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] cursor-pointer"
          style={{ background: "var(--color-primary)" }}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] cursor-pointer"
          style={{ color: "var(--color-text)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
