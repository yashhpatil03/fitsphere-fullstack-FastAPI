function ExerciseCard({ exercise, onDelete }) {
  return (
    <div className="fs-workout-card fs-animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h3 className="fs-h3" style={{ color: "var(--fs-electric)", marginBottom: 4 }}>{exercise.name}</h3>
          {exercise.muscleGroup && (
            <span className="fs-badge fs-badge-electric">{exercise.muscleGroup}</span>
          )}
        </div>
        <button
          onClick={() => onDelete(exercise.id)}
          className="fs-btn fs-btn-icon fs-btn-danger"
          style={{ width: 32, height: 32 }}
          title="Remove exercise"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {[
          { label: "Sets", value: exercise.sets, icon: "🔁" },
          { label: "Reps", value: exercise.reps, icon: "💪" },
        ].map(item => (
          <div key={item.label} style={{
            background: "var(--fs-surface-2)",
            borderRadius: "var(--fs-radius-md)",
            padding: "10px 8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.875rem", marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--fs-text-primary)" }}>{item.value}</div>
            <div className="fs-caption">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExerciseCard;
