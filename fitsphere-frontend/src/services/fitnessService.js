import api, { session } from "./api";

/**
 * Data layer for workouts, exercises, diet, progress, reports and admin.
 *
 * The React pages were built for a different backend, so this file ADAPTS
 * FastAPI responses into the shapes the existing components expect
 * (e.g. FastAPI `name` -> UI `title`). That keeps the visual components untouched.
 *
 * NOTE: every URL below ends with "/" exactly where FastAPI declares it.
 * (Without it FastAPI answers 307 and the browser blocks the redirected request.)
 */

const uid = () => {
  const id = session.getUserId();
  if (id == null) throw new Error("Not signed in");
  return id;
};

const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

// ───────────────────────── Workouts ─────────────────────────
export const toWorkoutUI = (w) => ({
  id: w.id,
  title: w.name,
  description: w.description ?? null,
  duration: w.duration,
  workoutDate: w.workout_date,
  exerciseCount: (w.exercises || []).length,
});

const fromWorkoutForm = (f) => ({
  name: f.title,
  description: f.description ?? null,
  duration: num(f.duration),
  user_id: uid(),
  workout_date: f.workoutDate || today(),
});

export async function getAllWorkouts() {
  const { data } = await api.get("/workouts/");
  return data.map(toWorkoutUI);
}

/** Backend returns a plain list, so paging is done here to keep the UI's pager working. */
export async function getWorkoutsPage(page = 0, size = 6) {
  const all = await getAllWorkouts();
  return {
    content: all.slice(page * size, page * size + size),
    totalPages: Math.ceil(all.length / size),
    total: all.length,
  };
}

export async function searchWorkouts(keyword) {
  const { data } = await api.get(`/workouts/search/${encodeURIComponent(keyword)}`);
  return data.map(toWorkoutUI);
}

export async function getWorkout(id) {
  const { data } = await api.get(`/workouts/${id}`);
  return toWorkoutUI(data);
}

export async function createWorkout(form) {
  const { data } = await api.post("/workouts/", fromWorkoutForm(form));
  return toWorkoutUI(data);
}

export async function updateWorkout(id, form) {
  const { data } = await api.put(`/workouts/${id}`, fromWorkoutForm(form));
  return toWorkoutUI(data);
}

export async function deleteWorkout(id) {
  await api.delete(`/workouts/${id}`);
}

// ───────────────────────── Exercises ─────────────────────────
export const toExerciseUI = (e) => ({ id: e.id, name: e.name, sets: e.sets, reps: e.reps });

export async function getExercises(workoutId) {
  const { data } = await api.get(`/workouts/${workoutId}/exercises/`);
  return data.map(toExerciseUI);
}

export async function createExercise(workoutId, { name, sets, reps }) {
  const { data } = await api.post(`/workouts/${workoutId}/exercises/`, {
    name,
    sets: Math.round(num(sets)),
    reps: Math.round(num(reps)),
  });
  return toExerciseUI(data);
}

export async function deleteExercise(workoutId, exerciseId) {
  await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
}

// ───────────────────────── Diet ─────────────────────────
export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export const toMealUI = (d) => ({
  id: d.id,
  mealName: d.food_name,
  mealType: d.meal_type,
  calories: d.calories,
  protein: d.protein,
  carbs: d.carbohydrates,
  fats: d.fats,
  mealDate: d.date,
});

const fromMealForm = (f) => ({
  food_name: f.mealName.trim(),
  meal_type: f.mealType,
  calories: num(f.calories),
  protein: num(f.protein),
  carbohydrates: num(f.carbs),
  fats: num(f.fats),
  date: f.mealDate,
  user_id: uid(),
});

export async function getMeals() {
  const { data } = await api.get("/diets/");
  return data.map(toMealUI);
}

export async function createMeal(form) {
  const { data } = await api.post("/diets/", fromMealForm(form));
  return toMealUI(data);
}

export async function updateMeal(id, form) {
  const { data } = await api.put(`/diets/${id}`, fromMealForm(form));
  return toMealUI(data);
}

export async function deleteMeal(id) {
  await api.delete(`/diets/${id}`);
}

export async function getTodaySummary() {
  const { data } = await api.get("/diets/summary/today", { params: { user_id: uid() } });
  return {
    totalCalories: data.total_calories,
    totalProtein: data.total_protein,
    totalCarbs: data.total_carbohydrates,
    totalFats: data.total_fats,
  };
}

export async function getDietStreak() {
  const { data } = await api.get(`/users/${uid()}/diet-streak`);
  return { currentStreak: data.diet_streak };
}

// ───────────────────────── Progress ─────────────────────────
export const toProgressUI = (p) => ({
  id: p.id,
  weight: p.weight,
  progressDate: p.date,
  bodyFat: p.body_fat ?? null,
  notes: p.notes ?? null,
});

export async function getProgress() {
  const { data } = await api.get("/progress/", { params: { user_id: uid() } });
  return data.map(toProgressUI);
}

export async function createProgress({ weight, progressDate }) {
  const { data } = await api.post("/progress/", {
    weight: Number(weight),
    date: progressDate,
    user_id: uid(),
  });
  return toProgressUI(data);
}

export async function updateProgress(id, { weight, progressDate, bodyFat = null, notes = null }) {
  const { data } = await api.put(`/progress/${id}`, {
    weight: Number(weight),
    date: progressDate,
    body_fat: bodyFat,
    notes,
    user_id: uid(),
  });
  return toProgressUI(data);
}

export async function deleteProgress(id) {
  await api.delete(`/progress/${id}`);
}

/** Returns null when the user has no records yet. */
export async function getAnalytics() {
  const { data } = await api.get("/progress/analytics", { params: { user_id: uid() } });
  if (!data.total_records) return null;
  const change = data.weight_change;
  return {
    startWeight: data.starting_weight,
    currentWeight: data.latest_weight,
    change,
    // Derived from the real change; ±0.5 kg counts as stable
    trend: change <= -0.5 ? "Losing" : change >= 0.5 ? "Gaining" : "Stable",
  };
}

const bmiCategory = (bmi) =>
  bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

/** Returns {} when BMI cannot be computed (no height set / no weight logged). */
export async function getBmi() {
  try {
    const { data } = await api.get("/progress/bmi", { params: { user_id: uid() } });
    return { bmi: data.bmi, category: bmiCategory(data.bmi) };
  } catch (err) {
    const s = err?.response?.status;
    if (s === 400 || s === 404) return {};
    throw err;
  }
}

// ───────────────────────── Reports / dashboard ─────────────────────────
export async function getDashboard() {
  const { data } = await api.get(`/users/${uid()}/dashboard`);
  return {
    totalWorkouts: data.total_workouts,
    todayCalories: data.today_calories,
    latestWeight: data.latest_weight,
    goal: data.goal,
  };
}

export async function getWorkoutStreak() {
  const { data } = await api.get(`/users/${uid()}/streak`);
  return { currentStreak: data.workout_streak };
}

/**
 * The backend's weekly/monthly reports only cover NUTRITION (calories eaten).
 * Workout counts/durations come from the user's real workout list, filtered by date.
 * "Calories burned" is not stored by the backend, so it is not reported.
 */
function workoutStats(workouts, days) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const inRange = workouts.filter((w) => {
    const d = new Date(`${w.workoutDate}T00:00:00`);
    return d >= start && d <= end;
  });
  const totalMinutes = inRange.reduce((s, w) => s + (w.duration || 0), 0);
  return {
    totalWorkouts: inRange.length,
    totalMinutes,
    averageWorkoutDuration: inRange.length ? Math.round(totalMinutes / inRange.length) : 0,
  };
}

export async function getWeeklyReport() {
  const [workouts, { data }] = await Promise.all([
    getAllWorkouts(),
    api.get(`/users/${uid()}/weekly-report`),
  ]);
  const daily = data.daily_calories || [];
  return {
    ...workoutStats(workouts, 7),
    totalCaloriesConsumed: daily.reduce((s, r) => s + Number(r.calories || 0), 0),
  };
}

export async function getMonthlyReport() {
  const [workouts, { data }] = await Promise.all([
    getAllWorkouts(),
    api.get(`/users/${uid()}/monthly-report`),
  ]);
  return {
    ...workoutStats(workouts, 30),
    totalCaloriesConsumed: Number(data.total_calories || 0),
  };
}

/** Rule-based tips from GET /ai/recommendations/{user_id}. */
export async function getRecommendations() {
  const { data } = await api.get(`/ai/recommendations/${uid()}`);
  return {
    workout: data.recommendations || [],
    diet: data.nutrition_tip ? [data.nutrition_tip] : [],
  };
}

// ───────────────────────── Admin ─────────────────────────
export async function adminListUsers() {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function adminGetUser(id) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

export async function adminDeleteUser(id) {
  await api.delete(`/admin/users/${id}`);
}
