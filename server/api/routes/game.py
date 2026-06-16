from fastapi import APIRouter, Header, HTTPException
from typing import Optional

router = APIRouter()

# These will be injected from server.py
session_manager = None
story_generator = None

# ==============================
# GAME STORY API
# ==============================

@router.post("/game/chat")
async def game_chat(
    data: dict,
    x_session_id: Optional[str] = Header(None)
):
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Session ID required")

    if not session_manager:
        raise HTTPException(status_code=500, detail="Session manager not initialized")

    game_state = session_manager.get_session(x_session_id)

    if not game_state:
        raise HTTPException(status_code=400, detail="Invalid session")

    message = data.get("message", "Start")

    try:
        response = await story_generator.generate_story_segment(
            session_id=x_session_id,
            game_state=game_state,
            previous_choice=message
        )

        game_state.story_beat += 1

        return response

    except Exception as e:
        print("❌ GAME ERROR:", e)

        # ✅ fallback (prevents crash)
        return {
            "story_text": "🌌 Your journey continues...",
            "choices": [],
            "image_prompts": []
        }