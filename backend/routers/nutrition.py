from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from ..services.nutrition_calc import calculate_glucose_curve, calculate_nutrient_timing

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


class GlucoseRequest(BaseModel):
    meal_type: str = "balanced"  # high-sugar, balanced, high-protein, high-carb
    duration_hours: float = 4.0


class NutrientTimingRequest(BaseModel):
    workout_time: str = "16:00"


@router.post("/glucose-curve")
async def get_glucose_curve(data: GlucoseRequest):
    """Get simulated glucose/energy curve for a meal type."""
    return calculate_glucose_curve(data.meal_type, data.duration_hours)


@router.post("/nutrient-timing")
async def get_nutrient_timing(data: NutrientTimingRequest):
    """Get optimal meal timing based on workout schedule."""
    return calculate_nutrient_timing(data.workout_time)


@router.get("/compare-curves")
async def compare_curves():
    """Get all meal type curves for side-by-side comparison."""
    meal_types = ["high-sugar", "balanced", "high-protein", "high-carb"]
    return {mt: calculate_glucose_curve(mt) for mt in meal_types}
