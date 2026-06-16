from fastapi import APIRouter
from pydantic import BaseModel
from services.flux_client import FluxClient
import os

router = APIRouter()

# ==============================
# REQUEST MODEL
# ==============================

class ImageRequest(BaseModel):
    prompt: str
    width: int = 512
    height: int = 512

# ==============================
# INIT CLIENT
# ==============================

flux_client = FluxClient(
    api_key=os.getenv("HUGGINGFACE_API_KEY")
)

# ==============================
# IMAGE GENERATION API
# ==============================

@router.post("/generate-image")
async def generate_image(data: ImageRequest):

    image_data = await flux_client.generate_image(
        prompt=data.prompt,
        width=data.width,
        height=data.height
    )

    # ❌ If API failed
    if not image_data:
        return {"error": "Image generation failed"}

    # ✅ Already base64 → just return
    return {
        "image": image_data
    }