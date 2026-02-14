from fastapi import APIRouter
from pydantic import BaseModel
from ..services.sleep_calc import calculate_optimal_bedtimes

router = APIRouter(prefix="/api/sleep", tags=["sleep"])


class SleepRequest(BaseModel):
    wake_time: str = "07:00"


@router.post("/optimize")
async def optimize_sleep(data: SleepRequest):
    """Calculate optimal bedtimes and sleep inertia window."""
    return calculate_optimal_bedtimes(data.wake_time)
