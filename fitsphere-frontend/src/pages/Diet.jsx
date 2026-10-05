import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DietCard from "../components/DietCard";
import { getErrorMessage } from "../services/api";
import {
  getMeals, createMeal, updateMeal, deleteMeal as apiDeleteMeal,
  getTodaySummary, getDietStreak, getRecommendations, MEAL_TYPES,
} from "../services/fitnessService";

const emptyForm = () => ({
  mealName: "", mealType: "breakfast", calories: "", protein: "", carbs: "", fats: "",
  mealDate: new Date().toISOString().slice(0, 10),
});

function Diet() {
  const [diets, setDiets] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });
  const [streak, setStreak] = useState({ currentStreak: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    const [dietsRes, summaryRes, streakRes, recRes] = await Promise.allSettled([
      getMeals(),
      getTodaySummary(),
      getDietStreak(),
      getRecommendations(),
    ]);
    if (dietsRes.status === "fulfilled") setDiets(dietsRes.value);
    else setError(getErrorMessage(dietsRes.reason, "Could not load meals."));
    if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
    if (streakRes.status === "fulfilled") setStreak(streakRes.value);
    if (recRes.status === "fulfilled") setRecommendations(recRes.value.diet);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await updateMeal(editingId, form);
      else await createMeal(form);
      closeForm();
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (meal) => {
    setEditingId(meal.id);
    setForm({
      mealName: meal.mealName, mealType: meal.mealType || "breakfast",
      calories: String(meal.calories ?? ""), protein: String(meal.protein ?? ""),
      carbs: String(meal.carbs ?? ""), fats: String(meal.fats ?? ""),
      mealDate: meal.mealDate,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMeal = async (id) => {
    setError("");
    try { await apiDeleteMeal(id); loadData(); } catch (err) { setError(getErrorMessage(err)); }
  };

  const macros = [
    { label: "Calories", value: summary.totalCalories || 0, unit: "kcal", color: "#F97316", bg: "rgba(249,115,22,0.08)", icon: "🔥" },
    { label: "Protein", value: summary.totalProtein || 0, unit: "g", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", icon: "💪" },
    { label: "Carbs", value: summary.totalCarbs || 0, unit: "g", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", icon: "🌾" },
    { label: "Fats", value: summary.totalFats || 0, unit: "g", color: "#10B981", bg: "rgba(16,185,129,0.08)", icon: "🥑" },
  ];

  return (
    <div className="fs-layout">
      <Sidebar />
      <main className="fs-main fs-page">

        {/* HERO */}
        <div style={{
          background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)",
          borderRadius: "var(--fs-radius-2xl)",
          padding: "40px",
          marginBottom: "var(--fs-space-8)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 50%, rgba(16,185,129,0.3) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p className="fs-hero-eyebrow" style={{ color: "#34D399" }}>Nutrition</p>
              <h1 className="fs-hero-title">Fuel Your Performance</h1>
              <p className="fs-hero-sub">Track every meal, hit your macros, stay consistent.</p>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 20px" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>{streak.currentStreak || 0}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Day Streak 🔥</div>
            </div>
          </div>
        </div>

        {/* TODAY'S MACROS */}
        <div className="fs-grid-4" style={{ marginBottom: "var(--fs-space-8)" }}>
          {macros.map(m => (
            <div key={m.label} className="fs-stat-card">
              <div className="stat-icon" style={{ background: m.bg, fontSize: 18 }}>{m.icon}</div>
              <div className="stat-value" style={{ color: m.color }}>{m.value}<span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--fs-text-tertiary)", marginLeft: 3 }}>{m.unit}</span></div>
              <div className="stat-label">Today's {m.label}</div>
            </div>
          ))}
        </div>

        {/* LOG MEAL SECTION */}
        <div style={{ marginBottom: "var(--fs-space-8)" }}>
          <div className="fs-section-header">
            <h2 className="fs-h2">Log a Meal</h2>
            <button onClick={() => (showForm ? closeForm() : setShowForm(true))} className={`fs-btn fs-btn-md ${showForm ? "fs-btn-secondary" : "fs-btn-primary"}`}>
              {showForm ? "Cancel" : "+ Add Meal"}
            </button>
          </div>

          {showForm && (
            <div className="fs-card fs-animate-in" style={{ padding: "24px" }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  {[
                    { key: "mealName", label: "Meal Name", type: "text", placeholder: "Grilled chicken & rice" },
                    { key: "mealType", label: "Meal Type", type: "select" },
                    { key: "calories", label: "Calories (kcal)", type: "number", placeholder: "500" },
                    { key: "protein", label: "Protein (g)", type: "number", placeholder: "40" },
                    { key: "carbs", label: "Carbs (g)", type: "number", placeholder: "60" },
                    { key: "fats", label: "Fats (g)", type: "number", placeholder: "15" },
                    { key: "mealDate", label: "Date", type: "date" },
                  ].map(f => (
                    <div key={f.key} className="fs-input-group">
                      <label className="fs-input-label">{f.label}</label>
                      {f.type === "select" ? (
                        <select className="fs-input fs-select" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required>
                          {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                      ) : (
                        <input type={f.type} className="fs-input" placeholder={f.placeholder || ""} value={form[f.key]} min={f.type === "number" ? "0" : undefined} step={f.type === "number" ? "any" : undefined} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="fs-btn fs-btn-primary fs-btn-md">{editingId ? "Save Changes" : "Save Meal"}</button>
              </form>
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div className="fs-card" style={{ padding: "24px", marginBottom: "var(--fs-space-8)" }}>
            <h2 className="fs-h2" style={{ marginBottom: "16px" }}>Nutrition Tips</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {recommendations.map((m, i) => (
                <div key={`dietrec-${i}-${m.slice(0,8)}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(16,185,129,0.06)", borderLeft: "3px solid var(--fs-success)", borderRadius: "0 var(--fs-radius-lg) var(--fs-radius-lg) 0", fontSize: "0.875rem", color: "var(--fs-text-secondary)" }}>
                  <span>✅</span> {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="fs-card" style={{ padding: "16px 20px", marginBottom: "var(--fs-space-6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderLeft: "3px solid var(--fs-error)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--fs-error)" }}>⚠️ {error}</span>
            <button onClick={loadData} className="fs-btn fs-btn-secondary fs-btn-sm">Retry</button>
          </div>
        )}

        {/* MEAL LIST */}
        <div>
          <div className="fs-section-header">
            <h2 className="fs-h2">Meal Log</h2>
            <span className="fs-caption">{diets.length} meals tracked</span>
          </div>
          {loading ? (
            <div className="fs-grid-3">
              {[1,2,3].map(i => (
                <div key={`meal-skeleton-${i}`} className="fs-card" style={{ padding: 20 }}>
                  <div className="fs-skeleton" style={{ height: 20, width: "70%", marginBottom: 12 }} />
                  <div className="fs-skeleton" style={{ height: 56 }} />
                </div>
              ))}
            </div>
          ) : diets.length === 0 ? (
            <div className="fs-empty-state fs-card" style={{ padding: "64px 24px" }}>
              <div className="empty-icon">🥗</div>
              <p style={{ fontWeight: 600, color: "var(--fs-text-primary)", marginBottom: 6 }}>No meals logged yet</p>
              <p style={{ fontSize: "0.875rem" }}>Start tracking your nutrition for better insights</p>
            </div>
          ) : (
            <div className="fs-grid-3">
              {diets.map(meal => <DietCard key={meal.id} meal={meal} onDelete={deleteMeal} onEdit={startEdit} />)}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Diet;
