from pydantic import BaseModel, EmailStr, ConfigDict, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    goal: str | None = None


class UserUpdate(BaseModel):
    """Fields a user may change on their own profile (no role/email/password)."""
    age: int | None = Field(default=None, ge=1, le=120)
    gender: str | None = Field(default=None, max_length=20)
    height: float | None = Field(default=None, gt=0, le=300)
    weight: float | None = Field(default=None, gt=0, le=500)
    goal: str | None = Field(default=None, max_length=100)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: int | None
    gender: str | None
    height: float | None
    weight: float | None
    goal: str | None
    role: str

    model_config = ConfigDict(from_attributes=True)


class ProfileResponse(UserResponse):
    profile_picture: str | None = None
