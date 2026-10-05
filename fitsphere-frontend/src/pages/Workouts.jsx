import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import WorkoutCard from "../components/WorkoutCard";
import AddWorkoutModal from "../components/AddWorkoutModal";
import WorkoutChart from "../components/WorkoutChart";
import { getErrorMessage } from "../services/api";
import {
  getWorkoutsPage, createWorkout, updateWorkout as apiUpdateWorkout,
  deleteWorkout as apiDeleteWorkout, searchWorkouts, getWeeklyReport, getMonthlyReport,
} from "../services/fitnessService";

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkouts = async () => {
    setError("");
    const [res, weekly, monthly] = await Promise.allSettled([
      getWorkoutsPage(page, 6),
      getWeeklyReport(),
      getMonthlyReport(),
    ]);
    if (res.status === "fulfilled") {
      setWorkouts(res.value.content);
      setTotalPages(res.value.totalPages);
    } else {
      setError(getErrorMessage(res.reason, "Could not load workouts."));
    }
    if (weekly.status === "fulfilled") setWeeklyReport(weekly.value);
    if (monthly.status === "fulfilled") setMonthlyReport(monthly.value);
    setLoading(false);
  };

  useEffect(() => { loadWorkouts(); }, [page]);

  // Run an API action, then refresh; show the real error message if it fails
  const run = async (action) => {
    setError("");
    try { await action(); await loadWorkouts(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const addWorkout = (w) => run(() => createWorkout(w));
  const deleteWorkout = (id) => run(() => apiDeleteWorkout(id));
  const updateWorkout = (id, w) => run(async () => { await apiUpdateWorkout(id, w); setEditingWorkout(null); });

  const searchWorkout = async () => {
    if (!search.trim()) { loadWorkouts(); return; }
    setError("");
    try { setWorkouts(await searchWorkouts(search.trim())); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const reportStats = [
    { id: "week-workouts",  label: "This Week",   sub: "Workouts", val: weeklyReport?.totalWorkouts || 0, icon: "📅" },
    { id: "week-minutes",   label: "This Week",   sub: "Minutes",  val: (weeklyReport?.totalMinutes || 0).toLocaleString(), icon: "🔥" },
    { id: "month-workouts", label: "This Month",  sub: "Workouts", val: monthlyReport?.totalWorkouts || 0, icon: "📊" },
    { id: "avg-duration",   label: "Avg Duration",sub: "Minutes",  val: weeklyReport?.averageWorkoutDuration || 0, icon: "⏱" },
  ];

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page">

        {/* HERO */}
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)",
          borderRadius: "var(--fs-radius-2xl)",
          padding: "40px",
          marginBottom: "var(--fs-space-8)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 50%, rgba(139,92,246,0.25) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="fs-hero-eyebrow" style={{ color: "#A78BFA" }}>Training</p>
            <h1 className="fs-hero-title">Build Strength Every Day</h1>
            <p className="fs-hero-sub">Track every rep, every set, every victory.</p>
            <button onClick={() => { setEditingWorkout(null); setShowModal(true); }} className="fs-btn fs-btn-primary fs-btn-md" style={{ marginTop: 24 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Log New Workout
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="fs-grid-4" style={{ marginBottom: "var(--fs-space-8)" }}>
          {reportStats.map((s) => (
            <div key={s.id} className="fs-stat-card">
              <div className="stat-icon" style={{ background: "var(--fs-surface-2)", fontSize: 18 }}>{s.icon}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label} · {s.sub}</div>
            </div>
          ))}
        </div>

        {/* SEARCH + RECOMMENDATIONS */}
        <div className="fs-grid-2" style={{ marginBottom: "var(--fs-space-8)" }}>
          {/* Search */}
          <div className="fs-card" style={{ padding: "24px", gridColumn: "1 / -1" }}>
            <h2 className="fs-h2" style={{ marginBottom: "16px" }}>Find Workouts</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="fs-input-with-icon" style={{ flex: 1 }}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" className="fs-input" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchWorkout()} />
              </div>
              <button onClick={searchWorkout} className="fs-btn fs-btn-primary fs-btn-md">Search</button>
            </div>
            {search && (
              <button onClick={() => { setSearch(""); loadWorkouts(); }} className="fs-btn fs-btn-ghost fs-btn-sm" style={{ marginTop: 10 }}>Clear</button>
            )}
          </div>

        </div>

        {/* CHART */}
        <div style={{ marginBottom: "var(--fs-space-8)" }}>
          <WorkoutChart />
        </div>

        {error && (
          <div className="fs-card" style={{ padding: "16px 20px", marginBottom: "var(--fs-space-6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderLeft: "3px solid var(--fs-error)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--fs-error)" }}>⚠️ {error}</span>
            <button onClick={loadWorkouts} className="fs-btn fs-btn-secondary fs-btn-sm">Retry</button>
          </div>
        )}

        {/* WORKOUT LIST */}
        <div style={{ marginBottom: "var(--fs-space-6)" }}>
          <div className="fs-section-header">
            <h2 className="fs-h2">Recent Workouts</h2>
            <span className="fs-caption">{workouts.length} shown</span>
          </div>

          {loading ? (
            <div className="fs-grid-3">
              {[1,2,3].map(i => (
                <div key={`workout-skeleton-${i}`} className="fs-card" style={{ padding: 20 }}>
                  <div className="fs-skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
                  <div className="fs-skeleton" style={{ height: 24, width: "80%", marginBottom: 12 }} />
                  <div className="fs-skeleton" style={{ height: 56 }} />
                </div>
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <div className="fs-empty-state fs-card" style={{ padding: "64px 24px" }}>
              <div className="empty-icon">🏋️</div>
              <p style={{ fontWeight: 600, color: "var(--fs-text-primary)", marginBottom: 6 }}>No workouts yet</p>
              <p style={{ fontSize: "0.875rem" }}>Log your first workout to start tracking your progress</p>
              <button onClick={() => setShowModal(true)} className="fs-btn fs-btn-primary fs-btn-md" style={{ marginTop: 16 }}>Log First Workout</button>
            </div>
          ) : (
            <div className="fs-grid-3">
              {workouts.map(w => (
                <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} onEdit={wk => { setEditingWorkout(wk); setShowModal(true); }} />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="fs-btn fs-btn-secondary fs-btn-md">← Previous</button>
            <span className="fs-caption" style={{ padding: "0 8px" }}>Page {page + 1} of {totalPages}</span>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} className="fs-btn fs-btn-secondary fs-btn-md">Next →</button>
          </div>
        )}

        {showModal && (
          <AddWorkoutModal
            onAdd={addWorkout} onUpdate={updateWorkout} editingWorkout={editingWorkout}
            onClose={() => { setShowModal(false); setEditingWorkout(null); }}
          />
        )}
      </main>
    </div>
  );
}

export default Workouts;
