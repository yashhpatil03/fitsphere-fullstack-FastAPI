from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user
from app.models.workout import Workout
from app.models.diet import Diet

router = APIRouter(
    prefix="/users",
    tags=["Streaks"]
)


def calculate_streak(activity_dates):
    dates = set(activity_dates)

    if not dates:
        return 0

    current_day = date.today()

    # Allow a streak to continue if the latest activity was yesterday.
    if current_day not in dates:
        current_day -= timedelta(days=1)

    streak = 0

    while current_day in dates:
        streak += 1
        current_day -= timedelta(days=1)

    return streak


@router.get("/{user_id}/streak")
def get_workout_streak(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    records = db.query(Workout.workout_date).filter(
        Workout.user_id == user_id
    ).all()

    dates = [record[0] for record in records]

    return {
        "user_id": user_id,
        "workout_streak": calculate_streak(dates)
    }


@router.get("/{user_id}/diet-streak")
def get_diet_streak(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    records = db.query(Diet.date).filter(
        Diet.user_id == user_id
    ).distinct().all()

    dates = [record[0] for record in records]

    return {
        "user_id": user_id,
        "diet_streak": calculate_streak(dates)
    }