from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/history/comics")
async def get_history(request: Request, email: str):

    comics_collection = request.app.state.comics_collection

    comics = list(
        comics_collection.find({"email": email}).sort("created_at", -1)
    )

    for c in comics:
        c["_id"] = str(c["_id"])

    return {"comics": comics}