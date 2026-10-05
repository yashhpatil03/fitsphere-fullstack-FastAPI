/** Receives the UI shape from fitnessService.toMealUI(): mealName, mealType, calories, protein, carbs, fats, mealDate */
function DietCard({ meal, onDelete, onEdit }) {
  const displayDate = meal.mealDate
    ? new Date(meal.mealDate + "T00:00:00").toLocaleDateString("en", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";
  return (
    <div className="fs-meal-card fs-animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <h3 className="fs-h3" style={{ marginBottom: "3px" }}>{meal.mealName}</h3>
          <p className="fs-caption">{displayDate}{meal.mealType ? ` · ${meal.mealType}` : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
        {onEdit && (
          <button
            onClick={() => onEdit(meal)}
            className="fs-btn fs-btn-icon fs-btn-secondary"
            style={{ width: 32, height: 32 }}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(meal.id)}
          className="fs-btn fs-btn-icon fs-btn-danger"
          style={{ width: 32, height: 32 }}
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
        </div>
      </div>

      <div
        style={{
          background: "rgba(249,115,22,0.08)",
          borderRadius: "var(--fs-radius-md)",
          padding: "10px",
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F97316" }}>{meal.calories}</div>
        <div className="fs-caption" style={{ color: "#F97316" }}>Calories</div>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {[
          { label: "Protein", value: `${meal.protein}g`, color: "#8B5CF6" },
          { label: "Carbs", value: `${meal.carbs}g`, color: "#0EA5E9" },
          { label: "Fats", value: `${meal.fats}g`, color: "#10B981" },
        ].map((m) => (
          <div
            key={m.label}
            className="fs-macro-pill"
            style={{
              background: `${m.color}10`,
              borderRadius: "var(--fs-radius-md)",
              padding: "8px 4px",
            }}
          >
            <span className="macro-value" style={{ color: m.color, fontSize: "0.95rem" }}>{m.value}</span>
            <span className="macro-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DietCard;
