"""
Integration tests: run against a REAL database (DATABASE_URL), not mocks.

    export DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/fitsphere_test
    export JWT_SECRET_KEY=some-long-random-test-secret
    pytest -v
"""
import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models.user import User

client = TestClient(app)


def _register_and_login(role=None, height=180.0):
    email = f"{uuid.uuid4().hex[:10]}@test.dev"
    r = client.post("/users/", json={
        "name": "Test User", "email": email,
        "password": "secret123", "height": height, "goal": "weight_loss",
    })
    assert r.status_code == 201, r.text
    uid = r.json()["id"]
    if role:
        with SessionLocal() as db:
            db.query(User).filter(User.id == uid).update({"role": role})
            db.commit()
    r = client.post("/auth/login", params={"email": email, "password": "secret123"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return uid, {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def alice():
    return _register_and_login()


@pytest.fixture(scope="module")
def bob():
    return _register_and_login()


@pytest.fixture(scope="module")
def admin():
    return _register_and_login(role="ADMIN")


# ---------- authentication ----------
def test_wrong_password_rejected():
    email = f"{uuid.uuid4().hex[:8]}@test.dev"
    client.post("/users/", json={"name": "x", "email": email, "password": "secret123"})
    r = client.post("/auth/login", params={"email": email, "password": "nope"})
    assert r.status_code == 401


def test_duplicate_email_conflict():
    email = f"{uuid.uuid4().hex[:8]}@test.dev"
    body = {"name": "x", "email": email, "password": "secret123"}
    assert client.post("/users/", json=body).status_code == 201
    assert client.post("/users/", json=body).status_code == 409


def test_me_returns_profile_without_password(alice):
    uid, h = alice
    r = client.get("/auth/me", headers=h)
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == uid and "password" not in body
    assert "height" in body and "profile_picture" in body


def test_garbage_token_is_401():
    r = client.get("/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert r.status_code == 401


@pytest.mark.parametrize("method,path", [
    ("get", "/workouts/"), ("get", "/diets/"), ("get", "/users/"),
    ("get", "/progress/?user_id=1"), ("get", "/users/1/dashboard"),
    ("get", "/users/1/streak"), ("get", "/ai/recommendations/1"),
    ("get", "/diets/summary/today?user_id=1"), ("get", "/admin/users"),
])
def test_endpoints_require_token(method, path):
    assert getattr(client, method)(path).status_code == 401


# ---------- workouts + exercises ----------
def test_workout_crud_and_exercises(alice):
    uid, h = alice
    r = client.post("/workouts/", headers=h, json={
        "name": "Push Day", "duration": 45, "user_id": uid,
        "workout_date": str(date.today())})
    assert r.status_code == 201, r.text
    wid = r.json()["id"]
    assert r.json()["workout_date"] == str(date.today())

    r = client.post(f"/workouts/{wid}/exercises/", headers=h,
                    json={"name": "Bench", "sets": 3, "reps": 10})
    assert r.status_code == 201
    eid = r.json()["id"]

    r = client.get(f"/workouts/{wid}/exercises/", headers=h)
    assert [e["name"] for e in r.json()] == ["Bench"]

    r = client.put(f"/workouts/{wid}", headers=h, json={
        "name": "Push Day v2", "duration": 50, "user_id": uid})
    assert r.status_code == 200 and r.json()["name"] == "Push Day v2"
    assert r.json()["workout_date"] == str(date.today())  # kept when omitted

    r = client.get("/workouts/search/push", headers=h)
    assert any(w["id"] == wid for w in r.json())

    assert client.delete(f"/workouts/{wid}/exercises/{eid}", headers=h).status_code == 200
    assert client.delete(f"/workouts/{wid}", headers=h).status_code == 200
    assert client.get(f"/workouts/{wid}", headers=h).status_code == 404


# ---------- ownership: no cross-user access ----------
def test_cross_user_isolation(alice, bob):
    a_id, ha = alice
    b_id, hb = bob

    wid = client.post("/workouts/", headers=ha, json={
        "name": "Alice private", "duration": 30, "user_id": a_id}).json()["id"]
    did = client.post("/diets/", headers=ha, json={
        "food_name": "Rice", "meal_type": "lunch", "calories": 300,
        "date": str(date.today()), "user_id": a_id}).json()["id"]
    pid = client.post("/progress/", headers=ha, json={
        "weight": 80, "date": str(date.today()), "user_id": a_id}).json()["id"]

    # Bob cannot read / modify / delete Alice's rows (404 = hidden)
    assert client.get(f"/workouts/{wid}", headers=hb).status_code == 404
    assert client.delete(f"/workouts/{wid}", headers=hb).status_code == 404
    assert client.put(f"/workouts/{wid}", headers=hb, json={
        "name": "hacked", "duration": 1, "user_id": b_id}).status_code == 404
    assert client.get(f"/workouts/{wid}/exercises/", headers=hb).status_code == 404
    assert client.post(f"/workouts/{wid}/exercises/", headers=hb,
                       json={"name": "x", "sets": 1, "reps": 1}).status_code == 404
    assert client.get(f"/diets/{did}", headers=hb).status_code == 404
    assert client.delete(f"/diets/{did}", headers=hb).status_code == 404
    assert client.delete(f"/progress/{pid}", headers=hb).status_code == 404

    # Bob cannot write rows AS Alice
    assert client.post("/workouts/", headers=hb, json={
        "name": "spoof", "duration": 1, "user_id": a_id}).status_code == 403
    assert client.post("/diets/", headers=hb, json={
        "food_name": "x", "meal_type": "lunch", "calories": 1,
        "date": str(date.today()), "user_id": a_id}).status_code == 403
    assert client.post("/progress/", headers=hb, json={
        "weight": 1, "date": str(date.today()), "user_id": a_id}).status_code == 403

    # Bob cannot read Alice's per-user reports
    for p in [f"/progress/?user_id={a_id}", f"/progress/analytics?user_id={a_id}",
              f"/progress/bmi?user_id={a_id}", f"/diets/summary/today?user_id={a_id}",
              f"/users/{a_id}/dashboard", f"/users/{a_id}/weekly-report",
              f"/users/{a_id}/monthly-report", f"/users/{a_id}/fitness-score",
              f"/users/{a_id}/goal-progress", f"/users/{a_id}/streak",
              f"/users/{a_id}/diet-streak", f"/ai/recommendations/{a_id}"]:
        assert client.get(p, headers=hb).status_code == 403, p

    # Lists only contain own data
    assert all(w["user_id"] == b_id for w in client.get("/workouts/", headers=hb).json())
    assert all(d["user_id"] == b_id for d in client.get("/diets/", headers=hb).json())

    # Alice's data still intact
    assert client.get(f"/workouts/{wid}", headers=ha).status_code == 200


# ---------- diet / progress / reports ----------
def test_diet_summary_route_not_shadowed(alice):
    uid, h = alice
    client.post("/diets/", headers=h, json={
        "food_name": "Oats", "meal_type": "breakfast", "calories": 250,
        "protein": 10, "carbohydrates": 40, "fats": 5,
        "date": str(date.today()), "user_id": uid})
    r = client.get(f"/diets/summary/today?user_id={uid}", headers=h)
    assert r.status_code == 200, r.text
    assert r.json()["total_calories"] >= 250


def test_diet_update(alice):
    uid, h = alice
    did = client.post("/diets/", headers=h, json={
        "food_name": "Egg", "meal_type": "breakfast", "calories": 70,
        "date": str(date.today()), "user_id": uid}).json()["id"]
    r = client.put(f"/diets/{did}", headers=h, json={
        "food_name": "Two eggs", "meal_type": "breakfast", "calories": 140,
        "date": str(date.today()), "user_id": uid})
    assert r.status_code == 200 and r.json()["calories"] == 140


def test_progress_bmi_and_analytics():
    uid, h = _register_and_login(height=180.0)
    today = date.today()
    client.post("/progress/", headers=h, json={
        "weight": 90, "date": str(today - timedelta(days=5)), "user_id": uid})
    client.post("/progress/", headers=h, json={
        "weight": 81, "date": str(today), "user_id": uid})
    a = client.get(f"/progress/analytics?user_id={uid}", headers=h).json()
    assert a["starting_weight"] == 90 and a["latest_weight"] == 81
    assert a["weight_change"] == -9
    bmi = client.get(f"/progress/bmi?user_id={uid}", headers=h).json()
    assert bmi["bmi"] == 25.0  # 81 / 1.8^2


def test_dashboard_and_streaks(alice):
    uid, h = alice
    assert client.get(f"/users/{uid}/dashboard", headers=h).status_code == 200
    assert client.get(f"/users/{uid}/weekly-report", headers=h).status_code == 200
    s = client.get(f"/users/{uid}/streak", headers=h).json()
    assert "workout_streak" in s
    r = client.get(f"/ai/recommendations/{uid}", headers=h).json()
    assert isinstance(r["recommendations"], list) and "nutrition_tip" in r


# ---------- profile ----------
def test_profile_update_whitelist(alice):
    uid, h = alice
    r = client.put("/users/me", headers=h, json={
        "age": 30, "gender": "Male", "height": 178, "weight": 79, "goal": "muscle_gain",
        "role": "ADMIN", "email": "evil@x.dev"})  # extra keys must be ignored
    assert r.status_code == 200, r.text
    me = client.get("/auth/me", headers=h).json()
    assert me["height"] == 178 and me["goal"] == "muscle_gain"
    assert me["role"].upper() != "ADMIN" and me["email"] != "evil@x.dev"


# ---------- admin ----------
def test_admin_boundary(alice, admin):
    a_id, ha = alice
    adm_id, hadm = admin
    assert client.get("/admin/users", headers=ha).status_code == 403
    assert client.get("/users/", headers=ha).status_code == 403
    assert client.delete(f"/admin/users/{adm_id}", headers=ha).status_code == 403
    assert client.get("/admin/users", headers=hadm).status_code == 200
    assert client.get("/users/", headers=hadm).status_code == 200
    assert client.get(f"/admin/users/{a_id}", headers=hadm).status_code == 200
    assert client.delete(f"/admin/users/{adm_id}", headers=hadm).status_code == 400  # self


def test_admin_delete_user():
    uid, _ = _register_and_login()
    _, hadm = _register_and_login(role="ADMIN")
    assert client.delete(f"/admin/users/{uid}", headers=hadm).status_code == 200
    assert client.get(f"/admin/users/{uid}", headers=hadm).status_code == 404


# ---------- CORS ----------
def test_cors_allows_frontend_only():
    ok = client.options("/auth/login", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"})
    assert ok.status_code == 200
    assert ok.headers["access-control-allow-origin"] == "http://localhost:5173"
    bad = client.options("/auth/login", headers={
        "Origin": "http://evil.example",
        "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers


# ---------- AI chat (Ollama not running in test env) ----------
def test_ai_chat_requires_auth_and_degrades_gracefully(alice):
    assert client.post("/ai/chat", json={"message": "hi"}).status_code == 401
    _, h = alice
    r = client.post("/ai/chat", headers=h, json={"message": "hi", "history": []})
    assert r.status_code in (200, 503)
    if r.status_code == 503:
        assert "detail" in r.json()
