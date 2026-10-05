import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import WorkoutChart from "../components/WorkoutChart";
import { getErrorMessage } from "../services/api";
import { getWeeklyReport, getMonthlyReport, getWorkoutStreak } from "../services/fitnessService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Reports() {
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef();


  const loadReports = async () => {
    setLoadError("");
    const [w, m, s] = await Promise.allSettled([
      getWeeklyReport(),
      getMonthlyReport(),
      getWorkoutStreak(),
    ]);
    if (w.status === "fulfilled") setWeeklyReport(w.value);
    if (m.status === "fulfilled") setMonthlyReport(m.value);
    if (s.status === "fulfilled") setStreak(s.value);
    const failed = [w, m, s].find(r => r.status === "rejected");
    if (failed) setLoadError(getErrorMessage(failed.reason, "Some report data could not be loaded."));
    setLoading(false);
  };

  useEffect(() => { loadReports(); }, []);

  const downloadPDF = async () => {
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save("FitSphere_Report.pdf");
    } catch (error) { setLoadError(getErrorMessage(error, "Could not export the PDF.")); }
    setExporting(false);
  };

  const getAchievement = (s) => {
    if (s >= 30) return { icon: "👑", label: "Fitness Legend", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    if (s >= 14) return { icon: "💪", label: "Dedicated Athlete", color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" };
    if (s >= 7) return { icon: "🔥", label: "Consistency Master", color: "#F97316", bg: "rgba(249,115,22,0.1)" };
    return { icon: "🚀", label: "Just Getting Started", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" };
  };

  const achievement = getAchievement(streak?.currentStreak || 0);

  const weekStats = [
    { label: "Workouts", value: weeklyReport?.totalWorkouts || 0 },
    { label: "Calories Eaten", value: Math.round(weeklyReport?.totalCaloriesConsumed || 0).toLocaleString() },
    { label: "Avg Duration", value: `${weeklyReport?.averageWorkoutDuration || 0} min` },
  ];

  const monthStats = [
    { label: "Workouts", value: monthlyReport?.totalWorkouts || 0 },
    { label: "Calories Eaten", value: Math.round(monthlyReport?.totalCaloriesConsumed || 0).toLocaleString() },
    { label: "Avg Duration", value: `${monthlyReport?.averageWorkoutDuration || 0} min` },
  ];

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page">

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "var(--fs-space-8)" }}>
          <div>
            <p className="fs-label" style={{ marginBottom: 6 }}>Analytics</p>
            <h1 className="fs-h1">Fitness Reports</h1>
            <p className="fs-body">A full picture of your training progress.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={downloadPDF}
              disabled={exporting}
              className="fs-btn fs-btn-primary fs-btn-md"
            >
              {exporting ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Exporting…
                </span>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export PDF
                </>
              )}
            </button>
            <button onClick={() => window.print()} className="fs-btn fs-btn-secondary fs-btn-md">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>

        {loadError && (
          <div className="fs-card" style={{ padding: "16px 20px", marginBottom: "var(--fs-space-6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderLeft: "3px solid var(--fs-error)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--fs-error)" }}>⚠️ {loadError}</span>
            <button onClick={loadReports} className="fs-btn fs-btn-secondary fs-btn-sm">Retry</button>
          </div>
        )}

        <div ref={reportRef}>

          {/* STREAK + ACHIEVEMENT */}
          <div className="fs-grid-2" style={{ marginBottom: "var(--fs-space-8)" }}>

            {/* Streak Hero */}
            <div style={{
              background: "linear-gradient(135deg, #7C2D12, #EA580C, #F97316)",
              borderRadius: "var(--fs-radius-2xl)",
              padding: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              boxShadow: "var(--fs-shadow-energy)",
            }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Current Streak</p>
                <p style={{ fontFamily: "var(--fs-font-display)", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{streak?.currentStreak || 0}</p>
                <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: "0.9rem" }}>consecutive workout days</p>
              </div>
              <div style={{ fontSize: "4rem", opacity: 0.9, lineHeight: 1 }}>🔥</div>
            </div>

            {/* Achievement */}
            <div className="fs-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: achievement.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>
                {achievement.icon}
              </div>
              <div>
                <p className="fs-label" style={{ marginBottom: 4 }}>Current Rank</p>
                <h2 style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.375rem", fontWeight: 700, color: achievement.color, margin: 0 }}>{achievement.label}</h2>
                <p className="fs-caption" style={{ marginTop: 4 }}>
                  {streak?.currentStreak >= 30 ? "Elite athlete — you're an inspiration!"
                    : streak?.currentStreak >= 14 ? `${30 - (streak?.currentStreak || 0)} more days to Fitness Legend`
                    : streak?.currentStreak >= 7 ? `${14 - (streak?.currentStreak || 0)} more days to Dedicated Athlete`
                    : `${7 - (streak?.currentStreak || 0)} more days to Consistency Master`}
                </p>
              </div>
            </div>
          </div>

          {/* WEEKLY + MONTHLY */}
          <div className="fs-grid-2" style={{ marginBottom: "var(--fs-space-8)" }}>

            {/* Weekly */}
            <div style={{
              background: "linear-gradient(135deg, #0C4A6E, #0369A1, #0EA5E9)",
              borderRadius: "var(--fs-radius-2xl)",
              padding: "28px",
              boxShadow: "var(--fs-shadow-electric)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: "1.25rem" }}>📅</span>
                <h2 style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>This Week</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {weekStats.map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--fs-radius-lg)", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.375rem", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.65)", marginTop: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly */}
            <div style={{
              background: "linear-gradient(135deg, #3B0764, #6D28D9, #8B5CF6)",
              borderRadius: "var(--fs-radius-2xl)",
              padding: "28px",
              boxShadow: "0 4px 24px rgba(139,92,246,0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: "1.25rem" }}>📊</span>
                <h2 style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>This Month</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {monthStats.map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--fs-radius-lg)", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--fs-font-display)", fontSize: "1.375rem", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.65)", marginTop: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHART */}
          <div style={{ marginBottom: "var(--fs-space-8)" }}>
            <WorkoutChart />
          </div>

          {/* PERFORMANCE PROGRESS BARS */}
          <div className="fs-card" style={{ padding: "28px" }}>
            <h2 className="fs-h2" style={{ marginBottom: "20px" }}>Performance Overview</h2>

            {[
              { label: "Weekly Training Minutes", value: weeklyReport?.totalMinutes || 0, max: 300, color: "#10B981", gradient: "var(--fs-grad-success)" },
              { label: "Monthly Workout Sessions", value: monthlyReport?.totalWorkouts || 0, max: 30, color: "#0EA5E9", gradient: "var(--fs-grad-primary)" },
              { label: "Average Session Duration (min)", value: weeklyReport?.averageWorkoutDuration || 0, max: 90, color: "#8B5CF6", gradient: "var(--fs-grad-purple)" },
            ].map(m => {
              const pct = Math.min((m.value / m.max) * 100, 100);
              return (
                <div key={m.label} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.875rem", color: "var(--fs-text-secondary)", fontWeight: 500 }}>{m.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--fs-text-primary)" }}>{m.value}</span>
                      <span className="fs-badge" style={{ background: `${m.color}18`, color: m.color }}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div className="fs-progress" style={{ height: 10 }}>
                    <div className="fs-progress-fill" style={{ width: `${pct}%`, background: m.gradient, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );
}

export default Reports;
