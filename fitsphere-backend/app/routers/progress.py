from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.progress import Progress
from app.models.user import User
from app.schemas.progress import ProgressCreate, ProgressResponse
from app.core.permissions import require_same_user
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/progress",
    tags=["Progress Tracking"]
)


def get_owned_progress(
    progress_id: int, db: Session, current_user: User
) -> Progress:
    progress = db.query(Progress).filter(
        Progress.id == progress_id,
        Progress.user_id == current_user.id,
    ).first()

    if not progress:
        raise HTTPException(
            status_code=404,
            detail="Progress record not found"
        )

    return progress


# CREATE PROGRESS
@router.post("/", response_model=ProgressResponse, status_code=201)
def create_progress(
    progress_data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(progress_data.user_id, current_user)

    new_progress = Progress(**progress_data.model_dump())

    db.add(new_progress)
    db.commit()
    db.refresh(new_progress)

    return new_progress


# GET ALL PROGRESS FOR A USER
@router.get("/", response_model=list[ProgressResponse])
def get_progress(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    return db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(Progress.date.asc(), Progress.id.asc()).all()


# GET ANALYTICS
@router.get("/analytics")
def get_analytics(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    records = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(Progress.date.asc(), Progress.id.asc()).all()

    if not records:
        return {
            "user_id": user_id,
            "total_records": 0,
            "message": "No progress records available"
        }

    first_weight = records[0].weight
    latest_weight = records[-1].weight

    weight_change = round(latest_weight - first_weight, 2)

    weights = [record.weight for record in records]

    return {
        "user_id": user_id,
        "total_records": len(records),
        "starting_weight": first_weight,
        "latest_weight": latest_weight,
        "weight_change": weight_change,
        "minimum_weight": min(weights),
        "maximum_weight": max(weights),
        "history": [
            {
                "date": record.date,
                "weight": record.weight
            }
            for record in records
        ]
    }


# BMI CALCULATION
@router.get("/bmi")
def calculate_bmi(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(user_id, current_user)

    user = current_user

    if not user.height or user.height <= 0:
        raise HTTPException(
            status_code=400,
            detail="Valid user height is required"
        )

    latest_record = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(Progress.date.desc(), Progress.id.desc()).first()

    if not latest_record:
        raise HTTPException(
            status_code=404,
            detail="No progress records available"
        )

    height_meters = user.height / 100
    bmi = latest_record.weight / (height_meters ** 2)

    return {
        "user_id": user_id,
        "weight": latest_record.weight,
        "height_cm": user.height,
        "bmi": round(bmi, 2)
    }


# UPDATE PROGRESS
@router.put("/{progress_id}", response_model=ProgressResponse)
def update_progress(
    progress_id: int,
    progress_data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_same_user(progress_data.user_id, current_user)
    progress = get_owned_progress(progress_id, db, current_user)

    for key, value in progress_data.model_dump().items():
        setattr(progress, key, value)

    db.commit()
    db.refresh(progress)

    return progress


# DELETE PROGRESS
@router.delete("/{progress_id}")
def delete_progress(
    progress_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = get_owned_progress(progress_id, db, current_user)

    db.delete(progress)
    db.commit()

    return {
        "message": "Progress record deleted successfully"
    }
