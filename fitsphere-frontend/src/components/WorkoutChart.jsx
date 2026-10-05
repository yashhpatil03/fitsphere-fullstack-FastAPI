import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getAllWorkouts } from "../services/fitnessService";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--fs-surface)",
        border: "1px solid var(--fs-border)",
        borderRadius: "var(--fs-radius-lg)",
        padding: "10px 14px",
        boxShadow: "var(--fs-shadow-lg)",
      }}>
        <p style={{ fontSize: "0.75rem", color: "var(--fs-text-tertiary)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--fs-electric)" }}>
          {payload[0].value} min
        </p>
      </div>
    );
  }
  return null;
};

function WorkoutChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {

    getAllWorkouts()
      .then((workouts) => {
        // Sum training minutes per day (the backend stores duration, not calories burned)
        const map = {};
        workouts.forEach((w) => {
          const d = w.workoutDate ? String(w.workoutDate).slice(0, 10) : null;
          if (!d) return;
          map[d] = (map[d] || 0) + (w.duration || 0);
        });
        const chartData = Object.entries(map)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([date, cal]) => ({
            date: new Date(`${date}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" }),
            minutes: cal,
          }));
        setData(chartData);
      })
      .catch(() => { setData([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fs-card" style={{ padding: "24px" }}>
        <div className="fs-skeleton" style={{ height: 24, width: 200, marginBottom: 16 }} />
        <div className="fs-skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  return (
    <div className="fs-card" style={{ padding: "24px" }}>
      <div className="fs-section-header">
        <div>
          <h2 className="fs-h2">Weekly Activity</h2>
          <p className="fs-caption" style={{ marginTop: 2 }}>Training minutes per day</p>
        </div>
        <span className="fs-badge fs-badge-electric">7 Days</span>
      </div>

      {data.length === 0 ? (
        <div className="fs-empty-state">
          <div className="empty-icon">📊</div>
          <p>{failed ? "Could not load activity data." : "Log workouts to see your activity chart"}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fs-border)" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--fs-text-tertiary)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--fs-text-tertiary)" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="minutes" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#colorCal)" dot={{ fill: "#0EA5E9", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default WorkoutChart;
