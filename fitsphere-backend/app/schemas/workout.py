from datetime import date

from pydantic import BaseModel, ConfigDict


class ExerciseCreate(BaseModel):
    name: str
    sets: int
    reps: int


class ExerciseResponse(BaseModel):
    id: int
    name: str
    sets: int
    reps: int

    model_config = ConfigDict(from_attributes=True)


class WorkoutCreate(BaseModel):
    name: str
    description: str | None = None
    duration: int
    user_id: int
    # Optional: defaults to today on create, unchanged on update when omitted.
    workout_date: date | None = None


class WorkoutResponse(BaseModel):
    id: int
    name: str
    description: str | None
    duration: int
    user_id: int
    workout_date: date
    exercises: list[ExerciseResponse] = []

    model_config = ConfigDict(from_attributes=True)
