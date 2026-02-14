import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "circadian_optimizer")


class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(MONGODB_URI)
        cls.db = cls.client[DB_NAME]
        print(f"✅ Connected to MongoDB: {DB_NAME}")

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            print("🔌 Disconnected from MongoDB")

    @classmethod
    def get_db(cls):
        return cls.db

    # Collection accessors
    @classmethod
    def users(cls):
        return cls.db["users"]

    @classmethod
    def sleep_logs(cls):
        return cls.db["sleep_logs"]

    @classmethod
    def meal_logs(cls):
        return cls.db["meal_logs"]

    @classmethod
    def workout_logs(cls):
        return cls.db["workout_logs"]

    @classmethod
    def schedules(cls):
        return cls.db["schedules"]
