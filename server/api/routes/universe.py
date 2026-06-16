from fastapi import APIRouter, HTTPException
import uuid

from core.session_manager import SessionManager
from core.story_generator import StoryGenerator
from core.generators.universe_generator import UniverseGenerator


def get_universe_router(
    session_manager: SessionManager,
    story_generator: StoryGenerator,
    mistral_client
):
    router = APIRouter()

    universe_generator = UniverseGenerator(mistral_client)

    @router.post("/universe/generate")
    async def generate_universe():
        try:
            print("🎮 Generating universe...")

            universe, style, genre, epoch, macguffin, hero_name, hero_desc = await universe_generator.generate()

            session_id = str(uuid.uuid4())

            game_state = session_manager.create_session(session_id)

            # ✅ store as dict
            game_state["universe"] = {
                "style": style["name"],
                "genre": genre,
                "epoch": epoch,
                "base_story": universe
            }

            return {
                "status": "ok",
                "session_id": session_id,
                "style": style,
                "genre": genre,
                "epoch": epoch,
                "base_story": universe,
                "macguffin": macguffin,
                "hero_name": hero_name,
                "hero_description": hero_desc
            }

        except Exception as e:
            print("❌ Universe error:", str(e))
            raise HTTPException(status_code=500, detail=str(e))

    return router