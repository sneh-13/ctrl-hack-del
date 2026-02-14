"""Sleep cycle calculator with sleep inertia offset logic."""

from datetime import datetime, timedelta

SLEEP_CYCLE_MINUTES = 90
FALL_ASLEEP_MINUTES = 14  # Average time to fall asleep
SLEEP_INERTIA_HOURS = 2   # Hours of reduced performance after waking
MIN_CYCLES = 3            # Minimum recommended sleep cycles
MAX_CYCLES = 6            # Maximum recommended sleep cycles


def calculate_optimal_bedtimes(wake_time_str: str) -> dict:
    """
    Given a wake-up time, calculate optimal bedtimes based on 90-minute sleep cycles.
    Also computes the sleep inertia window and best study time.
    """
    wake_time = datetime.strptime(wake_time_str, "%H:%M")

    bedtimes = []
    for n_cycles in range(MAX_CYCLES, MIN_CYCLES - 1, -1):
        sleep_duration = timedelta(minutes=n_cycles * SLEEP_CYCLE_MINUTES)
        fall_asleep_offset = timedelta(minutes=FALL_ASLEEP_MINUTES)
        bedtime = wake_time - sleep_duration - fall_asleep_offset
        
        hours = sleep_duration.total_seconds() / 3600
        
        bedtimes.append({
            "bedtime": bedtime.strftime("%H:%M"),
            "cycles": n_cycles,
            "sleep_hours": round(hours, 1),
            "quality": _get_quality_label(n_cycles),
        })

    # Sleep inertia window
    inertia_end = wake_time + timedelta(hours=SLEEP_INERTIA_HOURS)
    best_study_time = inertia_end

    # Build cycle visualization data
    cycle_blocks = _build_cycle_visualization(wake_time, bedtimes[0]["cycles"])

    return {
        "wake_time": wake_time_str,
        "recommended_bedtimes": bedtimes,
        "sleep_inertia": {
            "wake_time": wake_time_str,
            "inertia_end": inertia_end.strftime("%H:%M"),
            "duration_hours": SLEEP_INERTIA_HOURS,
            "warning": "Cognitive performance is reduced during sleep inertia. Avoid important decisions or complex tasks.",
        },
        "best_study_time": {
            "start": best_study_time.strftime("%H:%M"),
            "end": (best_study_time + timedelta(hours=2)).strftime("%H:%M"),
            "reason": "Post-inertia cortisol peak aligns with maximum cognitive performance. This is your Biological Prime Time for learning.",
        },
        "cycle_visualization": cycle_blocks,
    }


def _get_quality_label(cycles: int) -> str:
    if cycles >= 5:
        return "optimal"
    elif cycles == 4:
        return "good"
    else:
        return "minimum"


def _build_cycle_visualization(wake_time: datetime, total_cycles: int) -> list:
    """Build data for visualizing sleep cycles on a timeline."""
    fall_asleep = wake_time - timedelta(minutes=total_cycles * SLEEP_CYCLE_MINUTES)
    blocks = []
    
    for i in range(total_cycles):
        cycle_start = fall_asleep + timedelta(minutes=i * SLEEP_CYCLE_MINUTES)
        cycle_end = cycle_start + timedelta(minutes=SLEEP_CYCLE_MINUTES)
        
        # Sleep stages within each cycle (approximate distribution)
        stages = [
            {"stage": "Light Sleep (N1/N2)", "duration_min": 45, "start": cycle_start.strftime("%H:%M")},
            {"stage": "Deep Sleep (N3)", "duration_min": 25, "start": (cycle_start + timedelta(minutes=45)).strftime("%H:%M")},
            {"stage": "REM Sleep", "duration_min": 20, "start": (cycle_start + timedelta(minutes=70)).strftime("%H:%M")},
        ]
        
        # REM proportion increases in later cycles
        if i >= total_cycles // 2:
            stages[1]["duration_min"] = 15  # Less deep sleep
            stages[2]["duration_min"] = 30  # More REM
        
        blocks.append({
            "cycle": i + 1,
            "start": cycle_start.strftime("%H:%M"),
            "end": cycle_end.strftime("%H:%M"),
            "stages": stages,
            "is_rem_heavy": i >= total_cycles // 2,
        })
    
    return blocks
