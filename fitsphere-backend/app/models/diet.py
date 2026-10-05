from datetime import date

from sqlalchemy import (
    Integer,
    String,
    Float,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Diet(Base):
    __tablename__ = "diets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    food_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    meal_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    calories: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    protein: Mapped[float] = mapped_column(
        Float,
        default=0
    )

    carbohydrates: Mapped[float] = mapped_column(
        Float,
        default=0
    )

    fats: Mapped[float] = mapped_column(
        Float,
        default=0
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )