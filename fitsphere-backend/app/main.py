from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, settings
from app.models.user import User  # noqa: F401  (registers table)
from app.models.workout import Workout  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.diet import Diet  # noqa: F401
from app.models.progress import Progress  # noqa: F401
from app.routers import (
    users,
    auth,
    workouts,
    exercises,
    diets,
    progress,
    dashboard,
    streaks,
    ai_coach,
    admin,
    profile_picture,
    ai_chat,
)

app = FastAPI(
    title="FitSphere API",
    description="Fitness Management Backend",
    version="1.0.0",
)

# CORS: only the configured frontend origins (CORS_ORIGINS in .env).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        o.strip() for o in settings.cors_origins.split(",") if o.strip()
    ],
    allow_credentials=False,  # we use Authorization headers, not cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(exercises.router)
app.include_router(diets.router)
app.include_router(progress.router)
app.include_router(dashboard.router)
app.include_router(streaks.router)
app.include_router(ai_coach.router)
app.include_router(admin.router)
app.include_router(profile_picture.router)
app.include_router(ai_chat.router)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "Welcome to FitSphere API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "FitSphere",
    }


Path("uploads/profile_pictures").mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
