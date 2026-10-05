from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class DietCreate(BaseModel):
    food_name: str
    meal_type: str
    calories: float = Field(ge=0)
    protein: float = Field(default=0, ge=0)
    carbohydrates: float = Field(default=0, ge=0)
    fats: float = Field(default=0, ge=0)
    date: date
    user_id: int


class DietResponse(BaseModel):
    id: int
    food_name: str
    meal_type: str
    calories: float
    protein: float
    carbohydrates: float
    fats: float
    date: date
    user_id: int

    model_config = ConfigDict(from_attributes=True)
