import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a Chronobiology Coach — an expert in circadian rhythms, sleep science, and exercise physiology. Your role is to optimize a user's daily schedule based on their biological data.

RULES:
1. Always cite specific scientific concepts: adenosine buildup, cortisol awakening response, ultradian rhythms, sleep inertia, glycogen depletion, EPOC (Excess Post-Exercise Oxygen Consumption).
2. Predict "Focus Crash" windows (times when cognitive performance will drop) and "Strength Peak" windows (times when physical performance peaks — typically late afternoon).
3. Recommend schedule adjustments based on the user's sleep, meal, and energy data.
4. Return responses as valid JSON with the structure specified in each request.
5. Be specific with times (use 24-hour format) and explain the WHY behind each recommendation.
6. Consider the user's chronotype, sleep debt, and meal timing in all recommendations."""


async def get_ai_recommendations(user_data: dict) -> dict:
    """Get AI-powered schedule recommendations from Gemini."""
    prompt = f"""Based on the following user data, generate an optimized daily schedule.

USER DATA:
- Sleep: went to bed at {user_data.get('bedtime', 'unknown')}, woke up at {user_data.get('wake_time', 'unknown')}
- Sleep quality: {user_data.get('sleep_quality', 'unknown')}/10
- Last meal: {user_data.get('last_meal', 'unknown')} at {user_data.get('last_meal_time', 'unknown')}
- Current energy level: {user_data.get('energy_level', 'unknown')}/10
- Current mood: {user_data.get('mood', 'unknown')}
- Planned workout: {user_data.get('workout_type', 'none')} at {user_data.get('workout_time', 'not scheduled')}

Return a JSON object with this EXACT structure:
{{
    "biological_prime_time": {{
        "focus_peak": {{"start": "HH:MM", "end": "HH:MM", "reason": "..."}},
        "strength_peak": {{"start": "HH:MM", "end": "HH:MM", "reason": "..."}},
        "focus_crash": {{"start": "HH:MM", "end": "HH:MM", "reason": "..."}}
    }},
    "schedule_blocks": [
        {{
            "time": "HH:MM",
            "duration_min": 60,
            "activity": "Deep Work / High Intensity / Recovery / Light Tasks",
            "type": "focus|strength|recovery|light",
            "reason": "Scientific explanation"
        }}
    ],
    "alerts": [
        {{
            "time": "HH:MM",
            "type": "warning|tip|info",
            "message": "Actionable advice with scientific backing"
        }}
    ],
    "meal_recommendations": [
        {{
            "time": "HH:MM",
            "type": "high-carb|high-protein|balanced",
            "reason": "Why this meal type at this time"
        }}
    ]
}}"""

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                    response_mime_type="application/json",
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return _get_mock_response(user_data)
    else:
        return _get_mock_response(user_data)


def _get_mock_response(user_data: dict) -> dict:
    """Fallback mock response when API is unavailable."""
    wake = user_data.get("wake_time", "07:00")
    # Parse wake hour for relative scheduling
    try:
        wake_h = int(wake.split(":")[0])
    except:
        wake_h = 7

    return {
        "biological_prime_time": {
            "focus_peak": {
                "start": f"{(wake_h + 2) % 24:02d}:00",
                "end": f"{(wake_h + 4) % 24:02d}:00",
                "reason": "Cortisol awakening response peaks ~2h post-wake, boosting alertness and cognitive function. Adenosine levels are still low, maximizing focus capacity."
            },
            "strength_peak": {
                "start": "16:00",
                "end": "18:00",
                "reason": "Core body temperature reaches its daily maximum in late afternoon, increasing muscle flexibility, reaction time, and strength output by 5-10%."
            },
            "focus_crash": {
                "start": f"{(wake_h + 7) % 24:02d}:00",
                "end": f"{(wake_h + 8) % 24:02d}:00",
                "reason": "Post-lunch circadian dip combined with rising adenosine levels creates a natural alertness trough. This aligns with the post-prandial somnolence window."
            }
        },
        "schedule_blocks": [
            {"time": f"{(wake_h) % 24:02d}:00", "duration_min": 30, "activity": "Light Movement & Hydration", "type": "recovery", "reason": "Sleep inertia lasts 15-30 min post-wake. Light activity accelerates cortisol rise and clears residual adenosine."},
            {"time": f"{(wake_h + 1) % 24:02d}:00", "duration_min": 60, "activity": "Breakfast & Planning", "type": "light", "reason": "Breaking the overnight fast stabilizes blood glucose. Planning tasks leverage rising but not-yet-peak cortisol."},
            {"time": f"{(wake_h + 2) % 24:02d}:00", "duration_min": 120, "activity": "Deep Work Block", "type": "focus", "reason": "Peak biological prime time — cortisol and dopamine align for maximum sustained attention. Protect this window from interruptions."},
            {"time": f"{(wake_h + 4) % 24:02d}:00", "duration_min": 30, "activity": "Active Break", "type": "recovery", "reason": "Ultradian rhythm suggests 90-120 min focus cycles. Movement increases BDNF and restores attentional resources."},
            {"time": f"{(wake_h + 5) % 24:02d}:00", "duration_min": 90, "activity": "Secondary Focus Block", "type": "focus", "reason": "Still within the elevated cortisol window. Good for collaborative or creative tasks as rigid focus begins tapering."},
            {"time": f"{(wake_h + 7) % 24:02d}:00", "duration_min": 60, "activity": "Light Tasks / Admin", "type": "light", "reason": "Circadian dip period. Handle emails, errands, or low-demand tasks. Fighting this dip wastes willpower."},
            {"time": "16:00", "duration_min": 90, "activity": "High Intensity Training", "type": "strength", "reason": "Core body temp peaks, maximizing muscle performance. Testosterone-to-cortisol ratio is optimal. Risk of injury is lowest."},
            {"time": "18:00", "duration_min": 60, "activity": "Post-Workout Recovery & Dinner", "type": "recovery", "reason": "30-60 min post-exercise anabolic window. High-protein meal supports muscle protein synthesis via mTOR pathway activation."},
            {"time": "20:00", "duration_min": 90, "activity": "Light Study / Review", "type": "light", "reason": "Evening review leverages memory consolidation processes. Avoid intense learning — save that for the morning prime time."},
            {"time": "21:30", "duration_min": 60, "activity": "Wind Down", "type": "recovery", "reason": "Dim lights to support melatonin secretion onset. Blue light exposure now delays circadian phase by up to 90 minutes."}
        ],
        "alerts": [
            {"time": f"{(wake_h + 7) % 24:02d}:00", "type": "warning", "message": "⚡ Focus Crash incoming! Adenosine buildup + post-lunch circadian dip. Take a 20-min nap or walk outside for sunlight exposure to reset alertness."},
            {"time": "15:30", "type": "tip", "message": "🏋️ Pre-workout nutrition window: consume 30-50g complex carbs now for optimal glycogen availability during your 4 PM strength peak."},
            {"time": "20:00", "type": "info", "message": "🧠 Evening cortisol is dropping — ideal for reflective review but not new intensive learning. Consolidation, not acquisition."}
        ],
        "meal_recommendations": [
            {"time": f"{(wake_h + 1) % 24:02d}:00", "type": "balanced", "reason": "Post-fast meal: combine protein + complex carbs + healthy fats. Stabilizes blood glucose for the upcoming focus block."},
            {"time": f"{(wake_h + 5) % 24:02d}:30", "type": "balanced", "reason": "Pre-dip meal: balanced macros prevent sharp glucose spikes that worsen the afternoon circadian trough."},
            {"time": "15:30", "type": "high-carb", "reason": "Pre-workout carb loading: glycogen is the primary fuel for high-intensity exercise. 30-50g complex carbs 30-60 min pre-training."},
            {"time": "18:00", "type": "high-protein", "reason": "Post-workout anabolic window: 30-40g protein within 60 min triggers maximal muscle protein synthesis via leucine-mediated mTOR activation."}
        ]
    }
