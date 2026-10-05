from datetime import date

from sqlalchemy import Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    body_fat: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )