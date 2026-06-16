from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
from utils.jwt_handler import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str


# ==============================
# REGISTER
# ==============================

@router.post("/register")
async def register(data: LoginRequest, request: Request):

    users_collection = request.app.state.users_collection

    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # 🔥 STORE PASSWORD DIRECTLY (NO HASH)
    users_collection.insert_one({
        "email": data.email,
        "password": data.password,
        "created_at": datetime.utcnow()
    })

    return {"message": "User registered successfully"}


# ==============================
# LOGIN
# ==============================

@router.post("/login")
async def login(data: LoginRequest, request: Request):

    users_collection = request.app.state.users_collection

    user = users_collection.find_one({
        "email": data.email,
        "password": data.password  # 🔥 DIRECT MATCH
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": data.email})

    return {
        "message": "Login successful",
        "token": token,
        "email": data.email
    }