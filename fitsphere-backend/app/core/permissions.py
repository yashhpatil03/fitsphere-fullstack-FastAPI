from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.routers.auth import get_current_user


def is_admin(user: User) -> bool:
    # Roles are stored as "USER" / "ADMIN"; compare case-insensitively.
    return (user.role or "").upper() == "ADMIN"


def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


def require_same_user(user_id: int, current_user: User) -> None:
    """Block access to another user's data (admins use /admin/*)."""
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data"
        )
