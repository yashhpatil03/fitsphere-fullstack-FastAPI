import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import WorkoutChart from "../components/WorkoutChart";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { getDashboard, getWorkoutStreak, getBmi, getRecommendations } from "../services/fitnessService";

function SkeletonCard() {
  return (
    <div className="fs-stat-card">
      <div className="fs-skeleton" style={{ width: 44, height: 44, borderRadius: "var(--fs-radius-md)", marginBottom: 12 }} />
      <div className="fs-skeleton" style={{ width: "60%", height: 32, marginBottom: 8 }} />
      <div className="fs-skeleton" style={{ width: "40%", height: 16 }} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [dashboard, setDashboard] = useState({});
  const [streak, setStreak] = useState({});
  const [bmi, setBmi] = useState({});
  const [workoutRecs, setWorkoutRecs] = useState([]);
  const [dietRecs, setDietRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { user } = useAuth();
  const name = user?.name ? user.name.split(" ")[0] : "Athlete";

  const load = async () => {
    setLoading(true);
    setLoadError("");

    const [dashRes, streakRes, bmiRes, recRes] = await Promise.allSettled([
      getDashboard(),
      getWorkoutStreak(),
      getBmi(),
      getRecommendations(),
    ]);

    if (dashRes.status === "fulfilled") setDashboard(dashRes.value);
    if (streakRes.status === "fulfilled") setStreak(streakRes.value);
    if (bmiRes.status === "fulfilled") setBmi(bmiRes.value);
    if (recRes.status === "fulfilled") {
      setWorkoutRecs(recRes.value.workout);
      setDietRecs(recRes.value.diet);
    }

    // Show a retry banner only if the core dashboard call failed
    if (dashRes.status === "rejected") setLoadError(getErrorMessage(dashRes.reason));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page">

        {/* HERO GREETING */}
        <div style={{
          background: "var(--fs-grad-hero)",
          borderRadius: "var(--fs-radius-2xl)",
          padding: "40px 40px 36px",
          marginBottom: "var(--fs-space-8)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 80% 50%, rgba(14,165,233,0.2) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="fs-hero-eyebrow">Dashboard</p>
            <h1 className="fs-hero-title">{getGreeting()}, {name} 👋</h1>
            <p className="fs-hero-sub">Keep pushing toward your goals. Every rep counts.</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "24px" }}>
              <Link to="/workouts" className="fs-btn fs-btn-primary fs-btn-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Log Workout
              </Link>
              <Link to="/diet" className="fs-btn fs-btn-md" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                Track Nutrition
              </Link>
              <Link to="/progress" className="fs-btn fs-btn-md" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                Log Progress
              </Link>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="fs-card" style={{ padding: "16px 20px", marginBottom: "var(--fs-space-6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderLeft: "3px solid var(--fs-error)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--fs-error)" }}>⚠️ {loadError}</span>
            <button onClick={load} className="fs-btn fs-btn-secondary fs-btn-sm">Retry</button>
          </div>
        )}

        {/* STATS GRID */}
        <div className="fs-grid-4" style={{ marginBottom: "var(--fs-space-8)" }}>
          {loading ? (
            [1,2,3,4].map(i => <SkeletonCard key={`dash-skeleton-${i}`} />)
          ) : (
            <>
              <StatCard
                title="Workout Streak"
                value={`${streak.currentStreak || 0}d`}
                icon="🔥"
                gradient="energy"
              />
              <StatCard
                title="Total Workouts"
                value={dashboard.totalWorkouts || 0}
                icon="🏋️"
                gradient="primary"
              />
              <StatCard
                title="Calories Today"
                value={Math.round(dashboard.todayCalories || 0).toLocaleString()}
                icon="⚡"
                gradient="success"
              />
              <StatCard
                title={bmi.category ? `BMI · ${bmi.category}` : "BMI"}
                value={bmi.bmi ? Number(bmi.bmi).toFixed(1) : "—"}
                icon="⚖️"
                gradient="purple"
              />
            </>
          )}
        </div>

        {/* CHART */}
        <div style={{ marginBottom: "var(--fs-space-8)" }}>
          <WorkoutChart />
        </div>

        {/* RECOMMENDATIONS */}
        <div className="fs-grid-2">
          {/* Workout Recs */}
          <div className="fs-card" style={{ padding: "24px" }}>
            <div className="fs-section-header">
              <h2 className="fs-h2">💪 Workout Plan</h2>
              <Link to="/workouts" className="fs-caption" style={{ color: "var(--fs-electric)" }}>View all</Link>
            </div>
            {workoutRecs.length === 0 ? (
              <div className="fs-empty-state" style={{ padding: "24px" }}>
                <div className="empty-icon">🏋️</div>
                <p style={{ fontSize: "0.875rem" }}>No recommendations available yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {workoutRecs.map((item, i) => (
                  <div key={`wrec-${i}-${item.slice(0,10)}`} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 14px",
                    background: "var(--fs-surface-2)",
                    borderRadius: "var(--fs-radius-lg)",
                    fontSize: "0.875rem",
                    color: "var(--fs-text-secondary)",
                    borderLeft: "3px solid var(--fs-electric)",
                  }}>
                    <span style={{ width: 20, height: 20, background: "rgba(14,165,233,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--fs-electric)", flexShrink: 0 }}>{i+1}</span>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diet Recs */}
          <div className="fs-card" style={{ padding: "24px" }}>
            <div className="fs-section-header">
              <h2 className="fs-h2">🥗 Nutrition Tips</h2>
              <Link to="/diet" className="fs-caption" style={{ color: "var(--fs-success)" }}>View all</Link>
            </div>
            {dietRecs.length === 0 ? (
              <div className="fs-empty-state" style={{ padding: "24px" }}>
                <div className="empty-icon">🥗</div>
                <p style={{ fontSize: "0.875rem" }}>No nutrition tips available yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {dietRecs.map((item, i) => (
                  <div key={`drec-${i}-${item.slice(0,10)}`} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 14px",
                    background: "var(--fs-surface-2)",
                    borderRadius: "var(--fs-radius-lg)",
                    fontSize: "0.875rem",
                    color: "var(--fs-text-secondary)",
                    borderLeft: "3px solid var(--fs-success)",
                  }}>
                    <span style={{ width: 20, height: 20, background: "rgba(16,185,129,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--fs-success)", flexShrink: 0 }}>{i+1}</span>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
