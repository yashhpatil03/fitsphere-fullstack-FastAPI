from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User
from app.schemas.ai_chat import ChatRequest, ChatResponse
from app.services.ollama_service import generate_fitness_reply
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["AI Chatbot"]
)


@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat_with_fitness_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):

    user_context = f"""
    User name: {current_user.name}
    Fitness goal: {current_user.goal or "Not specified"}
    Age: {current_user.age or "Not specified"}
    Height in cm: {current_user.height or "Not specified"}
    Weight in kg: {current_user.weight or "Not specified"}
    """

    history = [
        item.model_dump()
        for item in request.history
    ]

    try:
        reply = await generate_fitness_reply(
            message=request.message,
            history=history,
            user_context=user_context
        )

        return ChatResponse(
            reply=reply,
            model="llama3.1:8b"
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        ) from exc