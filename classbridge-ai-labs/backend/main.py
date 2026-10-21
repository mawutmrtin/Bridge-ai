"""
ClassBridge AI Labs — FastAPI starter backend.
Run locally with: uvicorn main:app --reload
This starter exposes example lesson endpoints. Database persistence, authentication,
and a live AI provider are intentionally not configured until credentials and policies
are supplied.
"""
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="ClassBridge AI Labs API", version="0.1.0",
              description="Starter API for lessons, activities, results and approved-content tutoring.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LESSONS = [
    {"id":"fractions","title":"Explore fractions","subject":"Mathematics","level":"Primary","status":"prototype"},
    {"id":"water-cycle","title":"Discover the water cycle","subject":"Science","level":"Primary","status":"prototype"},
    {"id":"reaction","title":"Reaction observation","subject":"Chemistry","level":"Secondary","status":"prototype"},
]
results = []

class ResultIn(BaseModel):
    learner_id: Optional[str] = None
    activity_id: str
    score: Optional[int] = Field(default=None, ge=0, le=100)
    hypothesis: str = ""
    observations: str = ""
    conclusion: str = ""

class TutorQuestion(BaseModel):
    activity_id: str
    question: str = Field(min_length=1, max_length=1000)

@app.get("/health")
def health():
    return {"status":"ok","service":"ClassBridge AI Labs API","database":"not configured","ai":"not configured"}

@app.get("/api/lessons")
def list_lessons():
    return {"items": LESSONS}

@app.get("/api/lessons/{lesson_id}")
def get_lesson(lesson_id: str):
    lesson = next((item for item in LESSONS if item["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@app.post("/api/results", status_code=201)
def save_result(result: ResultIn):
    if not any(item["id"] == result.activity_id for item in LESSONS):
        raise HTTPException(status_code=404, detail="Activity not found")
    item = result.model_dump()
    item["id"] = len(results) + 1
    results.append(item)
    return {"saved":True,"result":item,"storage":"in-memory demo; configure PostgreSQL for durable storage"}

@app.get("/api/results")
def list_results():
    return {"items":results,"storage":"in-memory demo"}

@app.post("/api/tutor")
def tutor(question: TutorQuestion):
    if not any(item["id"] == question.activity_id for item in LESSONS):
        raise HTTPException(status_code=404, detail="Activity not found")
    # Safe placeholder: connect a provider only after adding server-side credentials,
    # approved curriculum documents, age-appropriate guardrails and output evaluation.
    return {
        "answer":"The live AI tutor is not connected yet. For now, use the activity's built-in guidance and verified explanations.",
        "mode":"placeholder",
        "next_step":"Configure a server-side AI provider and retrieval from educator-reviewed curriculum content."
    }
