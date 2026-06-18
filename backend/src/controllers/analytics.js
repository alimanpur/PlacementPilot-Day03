import prisma from "../prisma.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getAnalytics(req, res) {
  try {
    const uid = req.user.id;

    const [apps, dsaProblems, interviewQs] = await Promise.all([
      prisma.application.findMany({ where: { userId: uid }, orderBy: { createdAt: "desc" } }),
      prisma.dsaProblem.findMany({ where: { userId: uid } }),
      prisma.interviewQ.findMany({ where: { userId: uid } }),
    ]);

    const totalApps   = apps.length;
    const interviews  = apps.filter((a) => ["Interview", "Offer", "Rejected"].includes(a.status)).length;
    const offers      = apps.filter((a) => a.status === "Offer").length;
    const dsaSolved   = dsaProblems.filter((p) => p.solved).length;
    const totalDsa    = dsaProblems.length;
    const preparedQs  = interviewQs.filter((q) => q.prepared).length;
    const totalQs     = interviewQs.length;

    // Readiness score
    const appScore      = Math.min(totalApps / 20, 1) * 25;
    const dsaScore      = totalDsa   > 0 ? (dsaSolved  / totalDsa)  * 35 : 0;
    const interviewScore= totalQs    > 0 ? (preparedQs / totalQs)   * 25 : 0;
    const offerScore    = Math.min(offers / 2, 1) * 15;
    const readiness     = Math.round(appScore + dsaScore + interviewScore + offerScore);

    // Weekly activity (last 7 days)
    const today = startOfDay(new Date());
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const label    = DAY_LABELS[day.getDay()];
      const appCount = apps.filter((a) => startOfDay(a.createdAt).getTime() === day.getTime()).length;
      const dsaCount = dsaProblems.filter((p) => p.solvedAt && startOfDay(p.solvedAt).getTime() === day.getTime()).length;
      return { day: label, applications: appCount, dsa: dsaCount };
    });

    // This week applications
    const weekStart     = new Date(today); weekStart.setDate(today.getDate() - 6);
    const thisWeekApps  = apps.filter((a) => new Date(a.createdAt) >= weekStart).length;

    // Activity streak (consecutive days with any activity)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day    = new Date(today); day.setDate(today.getDate() - i);
      const dayTs  = day.getTime();
      const hasApp = apps.some((a) => startOfDay(a.createdAt).getTime() === dayTs);
      const hasDsa = dsaProblems.some((p) => p.solvedAt && startOfDay(p.solvedAt).getTime() === dayTs);
      if (hasApp || hasDsa) streak++;
      else break;
    }

    // Recent activity
    const recentApps = apps.slice(0, 3).map((a) => ({ type: "application", text: `Applied to ${a.role} at ${a.company}`, date: a.createdAt }));
    const recentDsa  = dsaProblems.filter((p) => p.solved && p.solvedAt).sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt)).slice(0, 2)
      .map((p) => ({ type: "dsa", text: `Solved: ${p.title}`, date: p.solvedAt }));
    const recent = [...recentApps, ...recentDsa].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // Achievements
    const achievements = [
      { id: "first_app",      label: "First Step",       desc: "Added your first application", unlocked: totalApps >= 1    },
      { id: "ten_apps",       label: "On a Roll",        desc: "10 applications submitted",    unlocked: totalApps >= 10   },
      { id: "dsa_50",         label: "Problem Solver",   desc: "Solved 50 DSA problems",       unlocked: dsaSolved >= 50   },
      { id: "dsa_100",        label: "DSA Master",       desc: "Solved 100 DSA problems",      unlocked: dsaSolved >= 100  },
      { id: "interview_ready",label: "Interview Ready",  desc: "Prepared 20+ questions",       unlocked: preparedQs >= 20  },
      { id: "offer",          label: "Offer Received",   desc: "Got your first offer!",        unlocked: offers >= 1       },
    ];

    // Goal progress
    const goals = [
      { label: "Applications", current: totalApps, target: 50,  unit: "apps"     },
      { label: "DSA Problems",  current: dsaSolved, target: 100, unit: "solved"   },
      { label: "Interview Prep",current: preparedQs,target: 35,  unit: "prepared" },
    ];

    // Best topic
    const topicSolvedMap = dsaProblems.filter((p) => p.solved).reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {});
    const bestTopic = Object.entries(topicSolvedMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Top applied role
    const roleMap = apps.reduce((acc, a) => { acc[a.role] = (acc[a.role] || 0) + 1; return acc; }, {});
    const topRole = Object.entries(roleMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Offer probability (simple heuristic)
    const offerProbability = Math.min(Math.round(readiness * 0.85), 99);

    res.json({
      readiness, totalApps, interviews, offers,
      dsaSolved, totalDsa, preparedQs, totalQs,
      weekly, recent, streak, thisWeekApps,
      achievements, goals, bestTopic, topRole, offerProbability,
    });
  } catch (err) {
    console.error("[ANALYTICS ERROR]", err.message);
    res.status(500).json({ message: "Analytics failed", error: err.message });
  }
}
