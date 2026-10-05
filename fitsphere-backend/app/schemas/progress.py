from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ProgressCreate(BaseModel):
    weight: float = Field(gt=0)
    body_fat: float | None = Field(default=None, ge=0, le=100)
    notes: str | None = None
    date: date
    user_id: int


class ProgressResponse(BaseModel):
    id: int
    weight: float
    body_fat: float | None
    notes: str | None
    date: date
    user_id: int

    model_config = ConfigDict(from_attributes=True)
