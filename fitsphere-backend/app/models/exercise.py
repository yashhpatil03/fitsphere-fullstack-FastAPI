from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    sets: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    reps: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    workout_id: Mapped[int] = mapped_column(
        ForeignKey("workouts.id"),
        nullable=False
    )

    workout: Mapped["Workout"] = relationship(
        back_populates="exercises"
    )