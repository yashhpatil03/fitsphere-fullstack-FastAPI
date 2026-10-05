from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.diet import Diet
from app.schemas.diet import DietCreate, DietResponse
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/diets",
    tags=["Diet Management"]
)


def get_owned_diet(diet_id: int, db: Session, current_user: User) -> Diet:
    diet = db.query(Diet).filter(
        Diet.id == diet_id,
        Diet.user_id == current_user.id,
    ).first()

    if not diet:
        raise HTTPException(
            status_code=404,
            detail="Diet record not found"
        )

    return diet


# CREATE
@router.post("/", response_model=DietResponse, status_code=201)
def create_diet(
    diet_data: DietCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(diet_data.user_id, current_user)

    new_diet = Diet(**diet_data.model_dump())

    db.add(new_diet)
    db.commit()
    db.refresh(new_diet)

    return new_diet


# READ ALL (own records only)
@router.get("/", response_model=list[DietResponse])
def get_diets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Diet).filter(
        Diet.user_id == current_user.id
    ).order_by(Diet.date.desc(), Diet.id.desc()).all()


# TODAY'S SUMMARY  (declared BEFORE "/{diet_id}", otherwise
# "summary" is parsed as a diet id and the request fails with 422)
@router.get("/summary/today")
def today_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    today = date.today()

    result = db.query(
        func.coalesce(func.sum(Diet.calories), 0),
        func.coalesce(func.sum(Diet.protein), 0),
        func.coalesce(func.sum(Diet.carbohydrates), 0),
        func.coalesce(func.sum(Diet.fats), 0),
    ).filter(
        Diet.user_id == user_id,
        Diet.date == today
    ).one()

    return {
        "user_id": user_id,
        "date": today,
        "total_calories": result[0],
        "total_protein": result[1],
        "total_carbohydrates": result[2],
        "total_fats": result[3],
    }


# READ ONE
@router.get("/{diet_id}", response_model=DietResponse)
def get_diet(
    diet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_diet(diet_id, db, current_user)


# UPDATE
@router.put("/{diet_id}", response_model=DietResponse)
def update_diet(
    diet_id: int,
    diet_data: DietCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(diet_data.user_id, current_user)
    diet = get_owned_diet(diet_id, db, current_user)

    for key, value in diet_data.model_dump().items():
        setattr(diet, key, value)

    db.commit()
    db.refresh(diet)

    return diet


# DELETE
@router.delete("/{diet_id}")
def delete_diet(
    diet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diet = get_owned_diet(diet_id, db, current_user)

    db.delete(diet)
    db.commit()

    return {"message": "Diet record deleted successfully"}
