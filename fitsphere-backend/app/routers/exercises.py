from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout
from app.models.exercise import Exercise
from app.schemas.workout import ExerciseCreate, ExerciseResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/workouts/{workout_id}/exercises",
    tags=["Exercises"]
)


def get_owned_workout(
    workout_id: int, db: Session, current_user: User
) -> Workout:
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id,
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    return workout


@router.post("/", response_model=ExerciseResponse, status_code=201)
def create_exercise(
    workout_id: int,
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_workout(workout_id, db, current_user)

    exercise = Exercise(
        **exercise_data.model_dump(),
        workout_id=workout_id
    )

    db.add(exercise)
    db.commit()
    db.refresh(exercise)

    return exercise


@router.get("/", response_model=list[ExerciseResponse])
def get_exercises(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_workout(workout_id, db, current_user)

    return db.query(Exercise).filter(
        Exercise.workout_id == workout_id
    ).order_by(Exercise.id).all()


@router.delete("/{exercise_id}")
def delete_exercise(
    workout_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_workout(workout_id, db, current_user)

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_id == workout_id
    ).first()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    db.delete(exercise)
    db.commit()

    return {"message": "Exercise deleted successfully"}
