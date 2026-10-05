from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.diet import Diet
from app.models.workout import Workout
from app.models.progress import Progress

router = APIRouter(
    prefix="/users",
    tags=["Dashboard & Reports"]
)


# DASHBOARD
@router.get("/{user_id}/dashboard")
def get_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()

    calories = db.query(
        func.coalesce(func.sum(Diet.calories), 0)
    ).filter(
        Diet.user_id == user_id,
        Diet.date == today
    ).scalar()

    latest_progress = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(
        Progress.date.desc(),
        Progress.id.desc()
    ).first()

    workout_count = db.query(Workout).filter(
        Workout.user_id == user_id
    ).count()

    bmi = None

    if latest_progress and user.height and user.height > 0:
        height_m = user.height / 100
        bmi = round(latest_progress.weight / (height_m ** 2), 2)

    return {
        "user_id": user.id,
        "name": user.name,
        "goal": user.goal,
        "today_calories": calories,
        "latest_weight": latest_progress.weight if latest_progress else None,
        "bmi": bmi,
        "total_workouts": workout_count
    }


# WEEKLY DIET REPORT
@router.get("/{user_id}/weekly-report")
def weekly_report(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    today = date.today()
    start_date = today - timedelta(days=6)

    daily_data = db.query(
        Diet.date,
        func.coalesce(func.sum(Diet.calories), 0).label("calories")
    ).filter(
        Diet.user_id == user_id,
        Diet.date >= start_date,
        Diet.date <= today
    ).group_by(
        Diet.date
    ).order_by(
        Diet.date
    ).all()

    return {
        "user_id": user_id,
        "period": "last 7 days",
        "daily_calories": [
            {
                "date": row.date,
                "calories": row.calories
            }
            for row in daily_data
        ]
    }


# MONTHLY DIET REPORT
@router.get("/{user_id}/monthly-report")
def monthly_report(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    today = date.today()
    start_date = today - timedelta(days=29)

    total_calories = db.query(
        func.coalesce(func.sum(Diet.calories), 0)
    ).filter(
        Diet.user_id == user_id,
        Diet.date >= start_date,
        Diet.date <= today
    ).scalar()

    return {
        "user_id": user_id,
        "period": "last 30 days",
        "total_calories": total_calories
    }


# FITNESS SCORE
@router.get("/{user_id}/fitness-score")
def fitness_score(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_workouts = db.query(Workout).filter(
        Workout.user_id == user_id
    ).count()

    progress_records = db.query(Progress).filter(
        Progress.user_id == user_id
    ).count()

    # Simple project demonstration metric, not a clinical score.
    score = min(100, total_workouts * 5 + progress_records * 2)

    return {
        "user_id": user_id,
        "fitness_score": score,
        "total_workouts": total_workouts,
        "progress_records": progress_records,
        "description": "Demonstration score based on recorded activity"
    }


# GOAL PROGRESS
@router.get("/{user_id}/goal-progress")
def goal_progress(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    latest = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(
        Progress.date.desc(),
        Progress.id.desc()
    ).first()

    return {
        "user_id": user_id,
        "goal": user.goal,
        "current_weight": latest.weight if latest else None,
        "message": "Set a measurable target weight to calculate percentage completion"
    }