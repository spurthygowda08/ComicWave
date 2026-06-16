from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from bson import ObjectId

router = APIRouter()

story_generator = None
flux_client = None

# ==============================
# GENERATE COMIC
# ==============================

@router.post("/comic/generate")
async def generate_comic(data: dict, request: Request):

    story = data.get("story")
    characters = data.get("characters", "")
    panel_count = data.get("panels", 4)
    style = data.get("style", "manga")
    user_email = data.get("email", "guest")

    if not story:
        raise HTTPException(status_code=400, detail="Story is required")

    try:
        result = await story_generator.generate_comic(
            story, characters, panel_count
        )
    except Exception as e:
        print(f"⚠️ Story generation failed: {e}")
        raise HTTPException(status_code=500, detail="Story generation failed")

    panels = []

    # ==============================
    # GENERATE PANELS + FIX IMAGE
    # ==============================

    for i, panel in enumerate(result.get("panels", [])):
        print(f"🎨 [{i+1}] Generating image...")

        image = None

        try:
            image = await flux_client.generate_image(panel["image_prompt"])

            if image and not image.startswith("http"):
                image = f"data:image/png;base64,{image}"

        except Exception as e:
            print(f"⚠️ Image generation failed: {e}")
            image = None

        if not image:
            image = "https://via.placeholder.com/512?text=No+Image"

        panels.append({
            "panel_number": panel.get("panel_number"),
            "scene": panel.get("scene"),
            "caption": panel.get("caption"),
            "dialogue": panel.get("dialogue"),
            "image": image
        })

    print(f"✅ Final panels generated: {len(panels)}")

    # ==============================
    # SAVE TO MONGODB
    # ==============================

    try:
        comics_collection = request.app.state.comics_collection

        comic_doc = {
            "story": story,
            "characters": characters,
            "style": style,
            "panels": panels,
            "user_email": user_email,
            "is_favorite": False,
            "created_at": datetime.utcnow()
        }

        comics_collection.insert_one(comic_doc)

        print(f"💾 Comic saved for user: {user_email}")

    except Exception as e:
        print(f"⚠️ MongoDB save failed: {e}")

    return {"panels": panels}


# ==============================
# GET USER HISTORY
# ==============================

@router.get("/history/comics")
async def get_user_history(request: Request, email: str):

    try:
        comics_collection = request.app.state.comics_collection

        comics_cursor = comics_collection.find(
            {"user_email": email}
        ).sort("created_at", -1)

        comics = []

        for comic in comics_cursor:
            comic["_id"] = str(comic["_id"])

            if "input_story" in comic:
                comic["story"] = comic["input_story"]

            if "is_favorite" not in comic:
                comic["is_favorite"] = False

            comics.append(comic)

        return {"comics": comics}

    except Exception as e:
        print(f"⚠️ History fetch failed: {e}")
        return {"comics": []}


# ==============================
# DELETE HISTORY ITEM
# ==============================

@router.delete("/history/delete")
async def delete_history(id: str, request: Request):

    try:
        comics_collection = request.app.state.comics_collection

        result = comics_collection.delete_one({"_id": ObjectId(id)})

        if result.deleted_count == 0:
            return {"message": "No record found"}

        return {"message": "Deleted successfully"}

    except Exception as e:
        print(f"⚠️ Delete failed: {e}")
        return {"message": "Delete failed"}


# ==============================
# ❤️ TOGGLE FAVORITE
# ==============================

@router.post("/history/favorite")
async def toggle_favorite(id: str, request: Request):

    try:
        comics_collection = request.app.state.comics_collection

        comic = comics_collection.find_one({"_id": ObjectId(id)})

        if not comic:
            return {"message": "Not found"}

        new_value = not comic.get("is_favorite", False)

        comics_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"is_favorite": new_value}}
        )

        return {"is_favorite": new_value}

    except Exception as e:
        print(f"⚠️ Favorite toggle failed: {e}")
        return {"message": "Error"}


# ==============================
# 🔗 GET SINGLE COMIC (SHARE LINK)
# ==============================

@router.get("/comic/{id}")
async def get_comic_by_id(id: str, request: Request):

    try:
        comics_collection = request.app.state.comics_collection

        comic = comics_collection.find_one({"_id": ObjectId(id)})

        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found")

        comic["_id"] = str(comic["_id"])

        if "is_favorite" not in comic:
            comic["is_favorite"] = False

        return comic

    except Exception as e:
        print(f"⚠️ Fetch single comic failed: {e}")
        raise HTTPException(status_code=500, detail="Error fetching comic")