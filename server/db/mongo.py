from pymongo import MongoClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(MONGO_URL)

db = client["comic_ai_db"]

# Collections
comics_collection = db["comics"]
chat_collection = db["chats"]
users_collection = db["users"]