from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId

router = APIRouter()

# =========================================
# GENERATE EPISODE
# =========================================
@router.post("/episode/generate")
async def generate_episode(data: dict, request: Request):

    # =====================================
    # REQUEST DATA
    # =====================================

    story = data.get("story")

    characters = data.get(
        "characters",
        ""
    )

    panel_count = data.get(
        "panels",
        4
    )

    style = data.get(
        "style",
        "manga"
    )

    season_id = data.get(
        "seasonId"
    )

    episode_index = data.get(
        "episodeIndex"
    )

    # ✅ IMPORTANT
    user_email = data.get(
        "userEmail",
        "guest"
    )

    # =====================================
    # VALIDATION
    # =====================================

    if not story:

        raise HTTPException(
            status_code=400,
            detail="Story required"
        )

    if not season_id:

        raise HTTPException(
            status_code=400,
            detail="Season ID required"
        )

    # =====================================
    # SERVICES
    # =====================================

    story_generator = (
        request.app.state.story_generator
    )

    flux_client = (
        request.app.state.flux_client
    )

    # =====================================
    # SERIES DATABASE
    # =====================================

    series_db = (
        request.app.state
        .comics_collection
        .database["series"]
    )

    # =====================================
    # FIND USER SEASON
    # =====================================

    season = series_db.find_one({

        "_id":
            ObjectId(season_id),

        # ✅ OWNER CHECK
        "userEmail":
            user_email
    })

    # =====================================
    # SECURITY CHECK
    # =====================================

    if not season:

        raise HTTPException(
            status_code=404,
            detail="Season not found or unauthorized"
        )

    # =====================================
    # GENERATE STORY PANELS
    # =====================================

    result = await story_generator.generate_comic(
        story,
        characters,
        panel_count
    )

    panels = []

    # =====================================
    # GENERATE IMAGES
    # =====================================

    for panel in result.get(
        "panels",
        []
    ):

        image = await flux_client.generate_image(
            panel["image_prompt"]
        )

        panels.append({

            "caption":
                panel.get("caption"),

            "dialogue":
                panel.get("dialogue"),

            "image":
                image
        })

    # =====================================
    # ENSURE EPISODE EXISTS
    # =====================================

    if (
        episode_index >=
        len(season["episodes"])
    ):

        raise HTTPException(
            status_code=400,
            detail="Episode not found"
        )

    # =====================================
    # UPDATE EPISODE
    # =====================================

    season["episodes"][episode_index][
        "story"
    ] = story

    season["episodes"][episode_index][
        "characters"
    ] = characters

    season["episodes"][episode_index][
        "style"
    ] = style

    season["episodes"][episode_index][
        "panelCount"
    ] = panel_count

    # ✅ IMPORTANT
    season["episodes"][episode_index][
        "panels"
    ] = panels

    season["episodes"][episode_index][
        "status"
    ] = "Completed"

    # =====================================
    # SAVE TO DATABASE
    # =====================================

    series_db.update_one(

        {
            "_id":
                ObjectId(season_id)
        },

        {
            "$set": {
                "episodes":
                    season["episodes"]
            }
        }
    )

    # =====================================
    # RESPONSE
    # =====================================

    return {

        "message":
            "Episode generated successfully",

        "panels":
            panels
    }