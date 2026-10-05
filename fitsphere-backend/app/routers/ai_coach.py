from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta

from app.database import get_db
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.workout import Workout
from app.models.diet import Diet

from app.services.recommendation_service import (
    generate_recommendations
)

router = APIRouter(
    prefix="/ai",
    tags=["AI Fitness Coach"]
)


@router.get("/recommendations/{user_id}")
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)


    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    workout_count = db.query(Workout).filter(
        Workout.user_id == user_id
    ).count()

    seven_days_ago = date.today() - timedelta(days=6)

    average_calories = db.query(
        func.coalesce(func.avg(Diet.calories), 0)
    ).filter(
        Diet.user_id == user_id,
        Diet.date >= seven_days_ago
    ).scalar()

    result = generate_recommendations(
        user,
        workout_count,
        float(average_calories)
    )

    return {
        "user_id": user.id,
        "goal": user.goal,
        "recommendations": result["recommendations"],
        "nutrition_tip": result["nutrition_tip"]
    }