from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# These will be injected from server.py
assistant = None
story_generator = None

# -----------------------------
# REQUEST MODEL
# -----------------------------

class AssistantRequest(BaseModel):
    message: str


# -----------------------------
# API ENDPOINT
# -----------------------------

@router.post("/assistant")
async def assistant_chat(data: AssistantRequest):

    # Step 1: Handle user message
    result = await assistant.handle_message(data.message)

    # -----------------------------
    # GENERATE MODE
    # -----------------------------
    if result["type"] == "generate":

        comic = await story_generator.generate_comic(
            story=data.message,
            characters="",
            panel_count=4,
            style="comic"
        )

        return {
            "type": "comic",
            "data": comic
        }

    # -----------------------------
    # GUIDE MODE
    # -----------------------------
    return result