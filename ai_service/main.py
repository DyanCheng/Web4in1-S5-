from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Service", description="AI capabilities for our app")

class PromptRequest(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    result: str

@app.post("/api/predict", response_model=AIResponse)
async def predict(request: PromptRequest):
    # Placeholder for actual AI processing
    return AIResponse(result=f"Simulated AI response for: {request.prompt}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}