import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient

# ==============================
# LOAD ENV VARIABLES
# ==============================

load_dotenv()

# ==============================
# IMPORT SERVICES
# ==============================

from core.story_generator import StoryGenerator
from core.assistant import Assistant
from services.flux_client import FluxClient
from services.mistral_client import MistralClient

# ==============================
# IMPORT ROUTES
# ==============================

from api.routes.comic import router as comic_router
from api.routes.auth import router as auth_router
from api.routes.chat import router as chat_router
from api.routes.image import router as image_router
from api.routes.assistant import router as assistant_router
from api.routes.series import router as series_router
from api.routes.episode import router as episode_router

# ==============================
# CONFIG
# ==============================

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

if not MISTRAL_API_KEY:
    raise ValueError("❌ MISTRAL_API_KEY not set")

if not HF_API_KEY:
    raise ValueError("❌ HUGGINGFACE_API_KEY not set")

# ==============================
# APP INIT
# ==============================

app = FastAPI(title="🚀 Comic Generator API (AI Assistant Enabled)")

# ==============================
# DATABASE
# ==============================

print("📦 Connecting to MongoDB...")

mongo_client = MongoClient(MONGO_URL)
db = mongo_client["comic_ai_db"]

app.state.comics_collection = db["comics"]
app.state.chat_collection = db["chats"]
app.state.users_collection = db["users"]

print("✅ MongoDB connected")

# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# SERVICES
# ==============================

print("🚀 Initializing services...")

story_generator = StoryGenerator(api_key=MISTRAL_API_KEY)
flux_client = FluxClient(api_key=HF_API_KEY)
mistral_client = MistralClient(api_key=MISTRAL_API_KEY)

assistant = Assistant(story_generator)

# 🔥 IMPORTANT FIX (ADD THIS)
app.state.story_generator = story_generator
app.state.flux_client = flux_client
app.state.mistral_client = mistral_client
app.state.assistant = assistant

print("✅ Services ready")

# ==============================
# INJECT SERVICES INTO ROUTES (OLD SYSTEM - KEEP)
# ==============================

import api.routes.comic as comic_module
comic_module.story_generator = story_generator
comic_module.flux_client = flux_client

import api.routes.chat as chat_module
chat_module.story_generator = story_generator

import api.routes.image as image_module
image_module.flux_client = flux_client

import api.routes.assistant as assistant_module
assistant_module.assistant = assistant
assistant_module.story_generator = story_generator

# ==============================
# REGISTER ROUTES
# ==============================

app.include_router(comic_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(image_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")

# 🔥 IMPORTANT: series WITHOUT prefix (your existing behavior)
app.include_router(series_router)

# 🔥 NEW AI ROUTE
app.include_router(episode_router, prefix="/api")

# ==============================
# ROOT
# ==============================

@app.get("/")
async def root():
    return {
        "message": "🚀 Comic Backend Running",
        "features": [
            "Comic Generation",
            "AI Assistant 🤖",
            "MongoDB Storage",
            "Image Generation"
        ]
    }

# ==============================
# HEALTH CHECK
# ==============================

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "database": "connected",
        "assistant": "active",
        "mistral": "configured"
    }

# ==============================
# EVENTS
# ==============================

@app.on_event("startup")
async def startup():
    print("🔥 Server started")
    print("🤖 AI Assistant Ready")

@app.on_event("shutdown")
async def shutdown():
    print("🔻 Shutting down...")
    await flux_client.close()
    mongo_client.close()

# ==============================
# RUN
# ==============================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)