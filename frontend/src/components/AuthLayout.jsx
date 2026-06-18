import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { Rocket, Briefcase, Code2, MessageSquare, TrendingUp } from "lucide-react";

const FEATURES = [
  { icon: Briefcase,     title: "Track Applications",  desc: "Every stage, every status — never lose track of an opportunity." },
  { icon: Code2,         title: "Master DSA",           desc: "Visual progress across 500+ problems. See exactly where you stand." },
  { icon: MessageSquare, title: "Ace Interviews",       desc: "Build your personal question bank. Walk in prepared, not anxious." },
  { icon: TrendingUp,    title: "Measure Readiness",    desc: "Live score that tells you exactly how ready you are to get offers." },
];

export function AuthLayout({ children, heading, sub }) {
  const leftRef  = useRef(null);
  const rightRef = useRef(null);
  const featsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftRef.current,  { x: -24, opacity: 0, duration: 0.55, ease: "power3.out" });
      gsap.from(rightRef.current, { x: 16,  opacity: 0, duration: 0.5,  delay: 0.1, ease: "power3.out" });
      gsap.from(featsRef.current?.querySelectorAll(".feat"), {
        x: -16, opacity: 0, duration: 0.4, stagger: 0.1, delay: 0.35, ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      {/* Left panel */}
      <div
        ref={leftRef}
        className="hidden lg:flex flex-col justify-between w-[58%] shrink-0 px-14 py-12"
        style={{ background: "var(--color-sidebar)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
            <Rocket size={15} color="#fff" />
          </div>
          <span className="text-[14px] font-bold text-white tracking-tight">PlacementPilot</span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "#555" }}>Career Operating System</p>
          <h1 className="text-[40px] font-bold leading-[1.1] mb-4 text-white" style={{ letterSpacing: "-0.03em" }}>
            Land your dream<br />role. Engineered.
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#666" }}>
            The only structured platform to track your applications, master algorithms, and walk into every interview fully prepared.
          </p>
        </div>

        <div ref={featsRef} className="flex flex-col gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feat flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Icon size={14} style={{ color: "var(--color-primary)" }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#ddd" }}>{title}</p>
                <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "#555" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px]" style={{ color: "#333" }}>Day 03 · 30 Projects in 30 Days</p>
      </div>

      {/* Right panel */}
      <div ref={rightRef} className="flex-1 flex flex-col items-center justify-center px-6 py-10 min-h-screen">
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
            <Rocket size={13} color="#fff" />
          </div>
          <span className="text-[13px] font-bold tracking-tight">PlacementPilot</span>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-6">
            <h2 className="text-[22px] font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>{heading}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{sub}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
