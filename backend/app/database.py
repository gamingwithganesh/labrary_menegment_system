import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db.db = db.client[settings.DB_NAME]
        # Ping the database to verify connection
        await db.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database '{settings.DB_NAME}' (Compass ready)!")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Running with memory fallback cache if needed.")
        db.db = db.client[settings.DB_NAME]

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db.db
