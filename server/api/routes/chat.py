from fastapi import APIRouter, Request
from pydantic import BaseModel
from core.story_generator import StoryGenerator
from datetime import datetime
import os

router = APIRouter()

# ==============================
# REQUEST MODEL
# ==============================

class ChatRequest(BaseModel):
    message: str
    characters: str = ""
    panels: int = 6
    style: str = "comic"

# ==============================
# INIT GENERATOR
# ==============================

story_generator = StoryGenerator(
    api_key=os.getenv("MISTRAL_API_KEY")
)

# ==============================
# MAIN API
# ==============================

@router.post("/chat")
async def chat(data: ChatRequest, request: Request):

    result = await story_generator.generate_comic(
        story=data.message,
        characters=data.characters,
        panel_count=data.panels,
        style=data.style
    )

    # SAVE TO MONGODB
    try:
        chat_collection = request.app.state.chat_collection

        chat_doc = {
            "user_message": data.message,
            "characters": data.characters,
            "panels": data.panels,
            "style": data.style,
            "response": result,
            "created_at": datetime.utcnow()
        }

        chat_collection.insert_one(chat_doc)

        print("💾 Chat saved to MongoDB")

    except Exception as e:
        print(f"⚠️ MongoDB save failed: {e}")

    return result