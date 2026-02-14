from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.llm_service import get_ai_recommendations
from ..database import Database

router = APIRouter(prefix="/api/coach", tags=["coach"])


class CoachRequest(BaseModel):
    bedtime: str = "23:00"
    wake_time: str = "07:00"
    sleep_quality: int = 7
    last_meal: str = "chicken and rice"
    last_meal_time: str = "12:30"
    energy_level: int = 6
    mood: str = "neutral"
    workout_type: Optional[str] = "strength training"
    workout_time: Optional[str] = "16:00"


@router.post("/analyze")
async def analyze_schedule(data: CoachRequest):
    """Get AI-powered circadian rhythm analysis and schedule optimization."""
    try:
        user_data = data.model_dump()
        recommendations = await get_ai_recommendations(user_data)
        
        # Store in MongoDB
        try:
            await Database.schedules().insert_one({
                "input": user_data,
                "recommendations": recommendations,
            })
        except Exception:
            pass  # Don't fail if DB is down
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mock")
async def get_mock_schedule():
    """Get a pre-built mock schedule for demo purposes."""
    mock_input = {
        "bedtime": "23:30",
        "wake_time": "07:00",
        "sleep_quality": 6,
        "last_meal": "pasta with vegetables",
        "last_meal_time": "13:00",
        "energy_level": 5,
        "mood": "tired",
        "workout_type": "strength training",
        "workout_time": "16:00",
    }
    return await get_ai_recommendations(mock_input)
