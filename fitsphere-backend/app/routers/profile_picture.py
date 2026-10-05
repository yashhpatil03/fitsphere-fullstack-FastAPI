from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Profile Picture"]
)

UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed"
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5 MB"
        )

    extension = ALLOWED_TYPES[file.content_type]

    filename = f"user_{current_user.id}_{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    file_path.write_bytes(contents)

    current_user.profile_picture = f"/uploads/profile_pictures/{filename}"

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture uploaded successfully",
        "profile_picture": current_user.profile_picture
    }
    
    
@router.delete("/me/profile-picture")
def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
      ):
    if not current_user.profile_picture:
        raise HTTPException(
            status_code=404,
            detail="No profile picture found"
        )

    filename = Path(current_user.profile_picture).name
    file_path = UPLOAD_DIR / filename

    if file_path.exists():
        file_path.unlink()

    current_user.profile_picture = None

    db.commit()

    return {
        "message": "Profile picture removed successfully"
    }