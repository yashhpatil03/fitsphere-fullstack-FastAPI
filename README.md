# FitSphere - React frontend + FastAPI backend
https://fitsphere-fullstack-fast-api-epww.vercel.app/login
## Quick start (Windows)
Requirements: Python 3.12+, Node.js 20+, PostgreSQL running with your `fitsphere` database.
1. Double-click `1-SETUP-ONCE.bat`   (creates the venv, installs Python + npm packages)
2. Double-click `2-START-APP.bat`    (starts backend :8080 and frontend :5173, opens the browser)
3. For the AI Coach: run `ollama serve` (once: `ollama pull llama3.1:8b`)

`fitsphere-backend\.env` is your original file (database + JWT secret unchanged) plus one
optional line, `CORS_ORIGINS`. Nothing else to configure. Frontend `.env` has `VITE_API_URL=http://127.0.0.1:8080`.

Manual commands, if you prefer:
    cd fitsphere-backend ; .venv\Scripts\activate ; uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
    cd fitsphere-frontend ; npm run dev

## 3. Open the site at http://localhost:5173 (or http://127.0.0.1:5173) - both are allowed by CORS.

## 4. Make an admin (see also 3-MAKE-ADMIN.txt)
New users get role USER. Promote one in PostgreSQL (psql / pgAdmin):
    UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
Then sign out and in again.

## 5. Tests
    cd fitsphere-backend
    set DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/TEST_DB   (use a SEPARATE test database)
    set JWT_SECRET_KEY=any-long-test-secret
    pytest -v
Production build: `npm run build` (in fitsphere-frontend).

## 6. Backend changes made (all necessary for security or to work at all)
| File | Change | Why |
|---|---|---|
| main.py | CORS middleware (origins from CORS_ORIGINS); cleaned duplicate router includes | browser was blocked; routers were included up to 3x |
| database.py / core/security.py | JWT secret read from .env (required); SQL echo off by default | secret was hard-coded in source |
| core/permissions.py | admin check is case-insensitive; `require_same_user` helper | default role is "USER" but check compared to lowercase "admin" so admin could never work |
| routers/users.py | GET /users/ now admin-only; NEW PUT /users/me | endpoint leaked every user (name, email); profile had no save endpoint |
| routers/workouts, exercises, diets, progress | JWT required; every row filtered by owner; user_id in body must equal logged-in user | ANY anonymous caller could read/edit/delete everyone's data |
| routers/dashboard, streaks, ai_coach | JWT required + own user_id only | same |
| routers/diets.py | `/summary/today` declared before `/{diet_id}` | route was shadowed, always 422 |
| routers/auth.py | GET /auth/me returns full profile (+profile_picture) | frontend needs it for session restore |
| schemas/workout.py | optional `workout_date` in create/response | frontend shows/edits dates; DB column already existed |
No database tables or columns were changed.

## 7. Frontend -> endpoint mapping
| Feature | FastAPI endpoint(s) |
|---|---|
| Register | POST /users/ |
| Login | POST /auth/login?email&password (query params, per backend contract) |
| Session restore / profile | GET /auth/me, PUT /users/me |
| Profile picture | POST/DELETE /users/me/profile-picture, files from /uploads/... |
| Dashboard | GET /users/{id}/dashboard, /streak, /progress/bmi, /ai/recommendations/{id} |
| Workouts | GET/POST /workouts/, GET/PUT/DELETE /workouts/{id}, GET /workouts/search/{kw} |
| Exercises | GET/POST /workouts/{id}/exercises/, DELETE .../{exercise_id} |
| Diet | GET/POST /diets/, PUT/DELETE /diets/{id}, GET /diets/summary/today, /users/{id}/diet-streak |
| Progress | GET/POST /progress/, PUT/DELETE /progress/{id}, /progress/analytics, /progress/bmi |
| Reports | /users/{id}/weekly-report, /monthly-report, /streak (+ workout list) |
| AI Coach | POST /ai/chat (+ history), GET /ai/recommendations/{id} |
| Admin | GET /admin/users, DELETE /admin/users/{id} |

New frontend files: `src/services/{api,authService,fitnessService}.js`, `src/context/AuthContext.jsx`, `.env`, `.env.example`.
Modified: App.jsx, ProtectedRoute.jsx, aiService.js, Sidebar, Login, Register, Dashboard, Workouts, Exercises, Diet, Progress, Reports, AiCoach, profile, AdminDashboard, AddWorkoutModal, WorkoutCard, WorkoutChart, ExerciseCard, DietCard.
Untouched: index.css and all styling, layouts, assets.

## 8. Features the backend cannot support (UI adjusted, nothing faked)
- **Calories burned** - backend stores no such field. Removed from workout form/card; chart shows training minutes; dashboard tile shows "Calories Today" (eaten); Reports show "Calories Eaten".
- **Exercise weight / muscle group** - not stored. Weight input and "Total Volume" removed (now "Total Reps").
- **Daily calorie goal** card (Diet) and field (Profile) - no backend data. Removed.
- **Goal-based workout plan** card (Workouts) - no endpoint. Removed.
- **Admin platform stats** (workouts/diet/progress totals) - no endpoint. Cards now show users, admins, users with a goal.
- **Recommendations** are the backend's rule-based tips (2 workout tips + 1 nutrition tip), not a meal list.
- **Server-side paging** doesn't exist (plain list); the Workouts pager pages in the browser.
- **Goal progress %** - backend explicitly has no target weight, so no percentage is shown.
- Added because the backend supports them but the UI didn't: diet edit, progress edit/delete, meal type, profile photo, admin delete.

## 9. Known remaining issues
- Login sends email+password as URL query parameters (backend contract). They can appear in server/proxy logs. Recommended: change `/auth/login` to accept a JSON body, then update `authService.login`.
- JWT is kept in localStorage (readable by any XSS). Acceptable for a learning project; httpOnly cookies are safer.
- No password rules on the backend (frontend requires 6 characters).
- Trailing-slash URLs (`/workouts/`) must stay exactly as written.
- `src/routes/AppRoutes.jsx` is unused legacy code (App.jsx is the real router) - left in place.
- ESLint reports 15 `set-state-in-effect` problems; the original project had the same 15.
