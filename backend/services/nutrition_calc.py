"""Nutrient timing and glucose curve simulation."""

import math


def calculate_glucose_curve(meal_type: str, time_hours: float = 4.0, points: int = 48) -> dict:
    """
    Simulate a glucose/energy curve for a given meal type over a time period.
    Returns data points for Recharts visualization.
    
    Meal types: 'high-sugar', 'balanced', 'high-protein', 'high-carb'
    """
    curves = {
        "high-sugar": _high_sugar_curve,
        "balanced": _balanced_curve,
        "high-protein": _high_protein_curve,
        "high-carb": _high_carb_curve,
    }
    
    curve_fn = curves.get(meal_type, _balanced_curve)
    data_points = []
    
    for i in range(points + 1):
        t = (i / points) * time_hours
        energy = curve_fn(t)
        data_points.append({
            "time_hours": round(t, 2),
            "time_label": _format_time_label(t),
            "energy": round(energy, 1),
        })
    
    return {
        "meal_type": meal_type,
        "duration_hours": time_hours,
        "data": data_points,
        "peak": _find_peak(data_points),
        "crash": _find_crash(data_points),
        "description": _get_meal_description(meal_type),
    }


def _high_sugar_curve(t: float) -> float:
    """Sharp spike then crash. Glucose rises fast, insulin overcorrects."""
    baseline = 50
    if t < 0.3:
        return baseline + 45 * (t / 0.3)  # Rapid rise
    elif t < 0.8:
        return baseline + 45 * math.exp(-3 * (t - 0.3))  # Exponential crash
    elif t < 2.0:
        return baseline + 45 * math.exp(-3 * 0.5) - 15 * math.sin(math.pi * (t - 0.8) / 1.2)  # Undershoot
    else:
        return baseline - 5 + 5 * (1 - math.exp(-(t - 2.0)))  # Slow recovery


def _balanced_curve(t: float) -> float:
    """Gradual rise, sustained plateau, gentle decline."""
    baseline = 50
    if t < 0.5:
        return baseline + 25 * (t / 0.5) * (1 - math.exp(-3 * t))
    elif t < 2.5:
        return baseline + 25 - 3 * (t - 0.5)  # Gentle decline
    else:
        return baseline + 25 - 3 * 2.0 - 5 * (t - 2.5)  # Tapering off


def _high_protein_curve(t: float) -> float:
    """Slow rise, long sustained energy, very gradual decline."""
    baseline = 50
    rise = 20 * (1 - math.exp(-1.5 * t))
    decline = max(0, 3 * (t - 2.0)) if t > 2.0 else 0
    return baseline + rise - decline


def _high_carb_curve(t: float) -> float:
    """Moderate spike, moderate duration. Between sugar and balanced."""
    baseline = 50
    if t < 0.5:
        return baseline + 35 * (t / 0.5) * (1 - math.exp(-4 * t))
    elif t < 1.5:
        return baseline + 35 - 10 * (t - 0.5)
    else:
        return baseline + 35 - 10 - 8 * (t - 1.5)


def _format_time_label(t: float) -> str:
    hours = int(t)
    minutes = int((t - hours) * 60)
    if hours == 0 and minutes == 0:
        return "Now"
    if hours == 0:
        return f"+{minutes}m"
    if minutes == 0:
        return f"+{hours}h"
    return f"+{hours}h{minutes}m"


def _find_peak(data: list) -> dict:
    peak = max(data, key=lambda d: d["energy"])
    return {"time": peak["time_label"], "energy": peak["energy"]}


def _find_crash(data: list) -> dict:
    crash = min(data, key=lambda d: d["energy"])
    return {"time": crash["time_label"], "energy": crash["energy"]}


def _get_meal_description(meal_type: str) -> str:
    descriptions = {
        "high-sugar": "High-sugar meals cause a rapid glucose spike followed by an insulin-driven crash. You'll feel an energy burst for 20-30 min, then a significant dip below baseline due to reactive hypoglycemia.",
        "balanced": "A balanced meal with protein, complex carbs, and healthy fats provides sustained energy over 2-3 hours. Glucose rises moderately and declines gradually without crashing.",
        "high-protein": "High-protein meals have the slowest glucose response and longest satiety. Energy rises gradually and sustains for 3-4 hours through gluconeogenesis and stable insulin levels.",
        "high-carb": "Complex carbohydrate meals provide moderate energy with good duration. Glycemic response is faster than protein but more sustained than simple sugars.",
    }
    return descriptions.get(meal_type, "")


def calculate_nutrient_timing(workout_time_str: str, meals: list = None) -> dict:
    """
    Calculate optimal meal timing based on workout schedule.
    Returns windows for pre-workout carbs, post-workout protein, etc.
    """
    from datetime import datetime, timedelta
    
    workout_time = datetime.strptime(workout_time_str, "%H:%M")
    
    pre_workout_window = {
        "start": (workout_time - timedelta(hours=2)).strftime("%H:%M"),
        "end": (workout_time - timedelta(minutes=30)).strftime("%H:%M"),
        "type": "high-carb",
        "recommendation": "30-50g complex carbohydrates (oats, sweet potato, whole grain bread). Provides glycogen for high-intensity output.",
        "science": "Muscle glycogen is the primary fuel source for resistance training and high-intensity cardio. Pre-loading ensures peak performance."
    }
    
    post_workout_window = {
        "start": workout_time.strftime("%H:%M"),
        "end": (workout_time + timedelta(hours=1)).strftime("%H:%M"),
        "type": "high-protein",
        "recommendation": "30-40g protein + 20-30g simple carbs (protein shake + banana). Maximizes muscle protein synthesis.",
        "science": "Leucine-rich protein activates mTOR pathway for muscle repair. Post-exercise insulin sensitivity is elevated, making this the optimal anabolic window."
    }
    
    # General meal windows
    meal_windows = [
        {
            "window": "Morning (within 1h of waking)",
            "type": "balanced",
            "recommendation": "Break the overnight fast with balanced macros to stabilize cortisol and blood glucose.",
            "science": "Cortisol is naturally high upon waking. Balanced nutrition prevents cortisol-driven catabolism."
        },
        pre_workout_window,
        post_workout_window,
        {
            "window": f"Evening (2-3h before bed)",
            "type": "high-protein",
            "recommendation": "Casein-rich protein (cottage cheese, Greek yogurt) for sustained overnight amino acid release.",
            "science": "Casein digests slowly, providing a steady amino acid supply during the overnight fasting/repair period."
        }
    ]
    
    return {
        "workout_time": workout_time_str,
        "pre_workout": pre_workout_window,
        "post_workout": post_workout_window,
        "meal_windows": meal_windows,
        "hydration": {
            "pre_workout": "500ml water 2h before exercise",
            "during": "150-250ml every 15-20 min during exercise",
            "post": "1.5L per kg of body weight lost during exercise"
        }
    }
