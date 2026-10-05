from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ProfileResponse,
)
from app.core.security import hash_password
from app.core.permissions import get_current_admin
from app.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# Public: registration. Role is never taken from the request body.
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        age=user_data.age,
        gender=user_data.gender,
        height=user_data.height,
        weight=user_data.weight,
        goal=user_data.goal,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# Was public (leaked every user). Now admin only.
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(User).all()


# NEW (additive): lets a user edit their own profile fields.
@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for key, value in data.model_dump().items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user
