from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout
from app.schemas.workout import WorkoutCreate, WorkoutResponse
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user

router = APIRouter(prefix="/workouts", tags=["Workouts"])


def get_owned_workout(
    workout_id: int, db: Session, current_user: User
) -> Workout:
    """404 for missing AND for other users' workouts (no existence leak)."""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id,
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    return workout


@router.post("/", response_model=WorkoutResponse, status_code=201)
def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(workout_data.user_id, current_user)

    values = workout_data.model_dump(exclude_none=True)
    new_workout = Workout(**values)

    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    return new_workout


@router.get("/", response_model=list[WorkoutResponse])
def get_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Workout).filter(
        Workout.user_id == current_user.id
    ).order_by(Workout.workout_date.desc(), Workout.id.desc()).all()


# Declared before "/{workout_id}" so "search" is never read as an id.
@router.get("/search/{keyword}", response_model=list[WorkoutResponse])
def search_workouts(
    keyword: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.name.ilike(f"%{keyword}%"),
    ).all()


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_workout(workout_id, db, current_user)


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(workout_data.user_id, current_user)
    workout = get_owned_workout(workout_id, db, current_user)

    # exclude_none keeps the existing date when workout_date is omitted
    for key, value in workout_data.model_dump(exclude_none=True).items():
        setattr(workout, key, value)

    # description may legitimately be cleared
    workout.description = workout_data.description

    db.commit()
    db.refresh(workout)

    return workout


@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout = get_owned_workout(workout_id, db, current_user)

    db.delete(workout)
    db.commit()

    return {"message": "Workout deleted successfully"}
