from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Database
from mock_data import seed_mock_data, get_mock_week
from routers import coach, sleep, nutrition


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage MongoDB connection lifecycle."""
    await Database.connect()
    await seed_mock_data()
    yield
    await Database.disconnect()


app = FastAPI(
    title="Circadian Rhythm Optimizer",
    description="AI-powered Biological Prime Time scheduler",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(coach.router)
app.include_router(sleep.router)
app.include_router(nutrition.router)


@app.get("/")
async def root():
    return {
        "name": "Circadian Rhythm Optimizer API",
        "version": "1.0.0",
        "endpoints": {
            "coach": "/api/coach/analyze",
            "sleep": "/api/sleep/optimize",
            "nutrition_glucose": "/api/nutrition/glucose-curve",
            "nutrition_timing": "/api/nutrition/nutrient-timing",
            "nutrition_compare": "/api/nutrition/compare-curves",
            "mock_data": "/api/mock/week",
        },
    }


@app.get("/api/mock/week")
async def get_mock_data():
    """Return pre-loaded mock student week for demo."""
    return get_mock_week()
