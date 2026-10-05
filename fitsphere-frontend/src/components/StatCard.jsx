function StatCard({ title, value, icon, gradient = "primary", change, changeLabel }) {
  const gradientMap = {
    primary: "linear-gradient(135deg,#0EA5E9,#22D3EE)",
    energy: "linear-gradient(135deg,#F97316,#FBBF24)",
    success: "linear-gradient(135deg,#10B981,#34D399)",
    purple: "linear-gradient(135deg,#8B5CF6,#A78BFA)",
    error: "linear-gradient(135deg,#EF4444,#F87171)",
  };

  const bgMap = {
    primary: "rgba(14,165,233,0.12)",
    energy: "rgba(249,115,22,0.12)",
    success: "rgba(16,185,129,0.12)",
    purple: "rgba(139,92,246,0.12)",
    error: "rgba(239,68,68,0.12)",
  };

  return (
    <div className="fs-stat-card fs-animate-in">
      <div
        className="stat-icon"
        style={{ background: bgMap[gradient] }}
      >
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {change !== undefined && (
        <div
          className="stat-change"
          style={{ color: change >= 0 ? "var(--fs-success)" : "var(--fs-error)" }}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)} {changeLabel}
        </div>
      )}
      <div className="stat-bg-icon">{icon}</div>
    </div>
  );
}

export default StatCard;
