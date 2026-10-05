import { Link } from "react-router-dom";

/**
 * WorkoutCard — receives the UI shape produced by fitnessService.toWorkoutUI():
 *   id, title, duration, workoutDate, exerciseCount
 * (The backend does not store calories burned, so the second tile shows the
 * number of exercises instead.)
 */
function WorkoutCard({ workout, onDelete, onEdit }) {
  // workoutDate is an ISO "2024-01-15" string
  const displayDate = workout.workoutDate
    ? new Date(workout.workoutDate + "T00:00:00").toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="fs-workout-card fs-animate-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div>
          <h3 className="fs-h3" style={{ marginBottom: "4px" }}>
            {workout.title}
          </h3>
          <p className="fs-caption">{displayDate}</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => onEdit(workout)}
            className="fs-btn fs-btn-icon fs-btn-secondary"
            title="Edit"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            className="fs-btn fs-btn-icon fs-btn-danger"
            title="Delete"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats — only fields that exist in WorkoutResponse */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            background: "var(--fs-surface-2)",
            borderRadius: "var(--fs-radius-md)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--fs-text-primary)",
            }}
          >
            {workout.duration ?? "—"}
          </div>
          <div className="fs-caption">Minutes</div>
        </div>
        <div
          style={{
            background: "rgba(249,115,22,0.08)",
            borderRadius: "var(--fs-radius-md)",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#F97316",
            }}
          >
            {workout.exerciseCount ?? "—"}
          </div>
          <div className="fs-caption" style={{ color: "#F97316" }}>
            Exercises
          </div>
        </div>
      </div>

      {/* Exercises link */}
      <Link
        to={`/exercises/${workout.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "10px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--fs-electric)",
          textDecoration: "none",
          padding: "6px 10px",
          background: "rgba(14,165,233,0.06)",
          borderRadius: "var(--fs-radius-md)",
          width: "fit-content",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" />
        </svg>
        View Exercises
      </Link>
    </div>
  );
}

export default WorkoutCard;
