from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout
from app.models.exercise import Exercise
from app.models.diet import Diet
from app.models.progress import Progress
from app.schemas.user import UserResponse
from app.core.permissions import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(User).all()


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete their own account"
        )

    # Get all workouts belonging to this user
    workouts = db.query(Workout).filter(
        Workout.user_id == user_id
    ).all()

    # Delete exercises belonging to those workouts first
    for workout in workouts:
        db.query(Exercise).filter(
            Exercise.workout_id == workout.id
        ).delete(synchronize_session=False)

    # Delete the user's workouts
    db.query(Workout).filter(
        Workout.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete user's diets
    db.query(Diet).filter(
        Diet.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete user's progress records
    db.query(Progress).filter(
        Progress.user_id == user_id
    ).delete(synchronize_session=False)

    # Finally delete the user
    db.delete(user)

    db.commit()

    return {"message": "User deleted successfully"}