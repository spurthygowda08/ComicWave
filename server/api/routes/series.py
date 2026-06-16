from fastapi import APIRouter
from db.mongo import db
from bson import ObjectId

router = APIRouter()

# 🔥 GET USER SEASONS
@router.get("/series")
async def get_series(email: str):

    # 🔥 FILTER BY USER EMAIL
    data = list(db.series.find({
        "userEmail": email
    }))

    for item in data:
        item["_id"] = str(item["_id"])

    return data


# 🔥 CREATE SEASON
@router.post("/series")
async def create_season(season: dict):

    # 🔥 SAFETY
    if "userEmail" not in season:
        season["userEmail"] = "guest"

    result = db.series.insert_one(season)

    return {
        "id": str(result.inserted_id)
    }


# 🔥 UPDATE SEASON
@router.put("/series/{season_id}")
async def update_season(season_id: str, updated: dict):

    # ✅ REMOVE _id BEFORE UPDATE
    if "_id" in updated:
        del updated["_id"]

    db.series.update_one(
        {"_id": ObjectId(season_id)},
        {"$set": updated}
    )

    return {
        "message": "Updated"
    }


# 🔥 DELETE SEASON
@router.delete("/series/{season_id}")
async def delete_season(season_id: str):

    db.series.delete_one({
        "_id": ObjectId(season_id)
    })

    return {
        "message": "Deleted"
    }