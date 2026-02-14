"""Pre-loaded mock data: a simulated week of a student's life."""

from database import Database
from datetime import datetime

MOCK_STUDENT_WEEK = {
    "user": {
        "name": "Alex Chen",
        "age": 21,
        "chronotype": "moderate_evening",
        "goal": "Balance academics with gym performance",
    },
    "days": [
        {
            "day": "Monday",
            "date": "2026-02-09",
            "sleep_log": {"bedtime": "23:00", "wake_time": "07:00", "quality": 7, "cycles_completed": 5},
            "meals": [
                {"time": "08:00", "type": "balanced", "description": "Oatmeal with banana and peanut butter"},
                {"time": "12:30", "type": "balanced", "description": "Grilled chicken wrap with veggies"},
                {"time": "15:30", "type": "high-carb", "description": "Sweet potato and rice (pre-workout)"},
                {"time": "18:00", "type": "high-protein", "description": "Protein shake + salmon dinner"},
            ],
            "workout": {"time": "16:00", "type": "strength", "muscles": ["chest", "triceps", "shoulders"], "intensity": 8},
            "energy_log": [
                {"time": "07:00", "level": 4, "note": "Sleep inertia — groggy"},
                {"time": "09:00", "level": 8, "note": "Peak focus — crushed study session"},
                {"time": "14:00", "level": 5, "note": "Post-lunch dip"},
                {"time": "16:30", "level": 9, "note": "Strength peak — great workout"},
                {"time": "20:00", "level": 6, "note": "Moderate energy for evening review"},
            ],
            "ai_schedule_result": "optimal",
        },
        {
            "day": "Tuesday",
            "date": "2026-02-10",
            "sleep_log": {"bedtime": "01:30", "wake_time": "07:00", "quality": 4, "cycles_completed": 3},
            "meals": [
                {"time": "09:00", "type": "high-sugar", "description": "Energy drink + muffin (bad choice)"},
                {"time": "13:00", "type": "balanced", "description": "Burrito bowl"},
                {"time": "19:00", "type": "high-protein", "description": "Steak and vegetables"},
            ],
            "workout": {"time": "16:00", "type": "strength", "muscles": ["back", "biceps"], "intensity": 5},
            "energy_log": [
                {"time": "07:00", "level": 2, "note": "Severe sleep debt — only 3 cycles"},
                {"time": "09:30", "level": 6, "note": "Sugar spike from energy drink"},
                {"time": "10:30", "level": 3, "note": "CRASH — reactive hypoglycemia"},
                {"time": "14:00", "level": 4, "note": "Dragging through afternoon"},
                {"time": "16:30", "level": 5, "note": "Subpar workout — sleep debt impacting strength"},
            ],
            "ai_schedule_result": "pivoted",
            "ai_pivot": {
                "original_plan": "Deep Work at 09:00, Gym at 16:00",
                "new_plan": "Light tasks until 11:00 (extended inertia), Nap at 14:00, Gym moved to 17:00",
                "reason": "Only 3 sleep cycles completed. Adenosine levels are critically high. Sleep inertia extended to ~3h. AI recommended a 20-min power nap to partially clear adenosine before training.",
            },
        },
        {
            "day": "Wednesday",
            "date": "2026-02-11",
            "sleep_log": {"bedtime": "22:30", "wake_time": "07:00", "quality": 8, "cycles_completed": 5},
            "meals": [
                {"time": "07:30", "type": "balanced", "description": "Eggs, toast, avocado"},
                {"time": "12:00", "type": "balanced", "description": "Quinoa salad with grilled chicken"},
                {"time": "15:00", "type": "high-carb", "description": "Banana + granola bar (pre-workout)"},
                {"time": "17:30", "type": "high-protein", "description": "Protein shake + turkey meal prep"},
            ],
            "workout": {"time": "15:30", "type": "cardio", "muscles": ["legs", "core"], "intensity": 7},
            "energy_log": [
                {"time": "07:00", "level": 5, "note": "Good wake, mild inertia"},
                {"time": "09:00", "level": 9, "note": "Excellent focus — cortisol peak"},
                {"time": "13:00", "level": 6, "note": "Manageable post-lunch dip"},
                {"time": "15:30", "level": 7, "note": "Good cardio session"},
                {"time": "20:00", "level": 6, "note": "Relaxed evening study"},
            ],
            "ai_schedule_result": "optimal",
        },
        {
            "day": "Thursday",
            "date": "2026-02-12",
            "sleep_log": {"bedtime": "23:00", "wake_time": "06:30", "quality": 7, "cycles_completed": 4},
            "meals": [
                {"time": "07:00", "type": "balanced", "description": "Smoothie bowl"},
                {"time": "11:30", "type": "balanced", "description": "Sandwich with soup"},
                {"time": "14:30", "type": "high-carb", "description": "Rice cakes with honey"},
                {"time": "17:00", "type": "high-protein", "description": "Chicken stir fry"},
            ],
            "workout": {"time": "15:00", "type": "strength", "muscles": ["legs", "glutes"], "intensity": 9},
            "energy_log": [
                {"time": "06:30", "level": 5, "note": "Slightly early wake"},
                {"time": "08:30", "level": 8, "note": "Strong focus block"},
                {"time": "13:00", "level": 5, "note": "Afternoon dip"},
                {"time": "15:30", "level": 9, "note": "Leg day PR — peak strength window"},
                {"time": "19:00", "level": 4, "note": "Post-leg-day fatigue"},
            ],
            "ai_schedule_result": "optimal",
        },
        {
            "day": "Friday",
            "date": "2026-02-13",
            "sleep_log": {"bedtime": "02:00", "wake_time": "09:00", "quality": 5, "cycles_completed": 4},
            "meals": [
                {"time": "10:00", "type": "high-sugar", "description": "Coffee and donut"},
                {"time": "14:00", "type": "balanced", "description": "Poke bowl"},
                {"time": "20:00", "type": "balanced", "description": "Pizza with friends"},
            ],
            "workout": None,
            "energy_log": [
                {"time": "09:00", "level": 3, "note": "Late night studying — heavy sleep debt"},
                {"time": "10:30", "level": 5, "note": "Caffeine + sugar temporary boost"},
                {"time": "12:00", "level": 3, "note": "Crash — worse than baseline"},
                {"time": "15:00", "level": 5, "note": "Gradually recovering"},
                {"time": "20:00", "level": 6, "note": "Social energy boost"},
            ],
            "ai_schedule_result": "pivoted",
            "ai_pivot": {
                "original_plan": "Deep Work at 11:00, Gym at 16:00",
                "new_plan": "Rest day declared. Light review only. No gym — recovery prioritized. Early bedtime recommended at 22:00.",
                "reason": "Cumulative sleep debt from late-night study session. Circadian phase has shifted ~2h later. Training while sleep-deprived increases cortisol and injury risk by 60%. AI prescribed a recovery day.",
            },
        },
    ],
}


async def seed_mock_data():
    """Seed the database with mock student data if it's empty."""
    try:
        db = Database.get_db()
        if db is None:
            print("⚠️ Database not connected — skipping mock data seed")
            return

        existing = await Database.users().count_documents({})
        if existing > 0:
            print("📦 Mock data already exists — skipping seed")
            return

        # Insert user
        await Database.users().insert_one(MOCK_STUDENT_WEEK["user"])

        # Insert daily logs
        for day in MOCK_STUDENT_WEEK["days"]:
            await Database.sleep_logs().insert_one({
                "date": day["date"],
                **day["sleep_log"],
            })
            for meal in day["meals"]:
                await Database.meal_logs().insert_one({
                    "date": day["date"],
                    **meal,
                })
            if day["workout"]:
                await Database.workout_logs().insert_one({
                    "date": day["date"],
                    **day["workout"],
                })

        print("✅ Mock data seeded successfully (5-day student week)")
    except Exception as e:
        print(f"⚠️ Mock data seed failed: {e}")


def get_mock_week():
    """Return the raw mock week data for the frontend."""
    return MOCK_STUDENT_WEEK
