"""
Simple test version of OMR service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="OMR Scanner Service - Test",
    description="Test version of OMR scanner service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "OMR Scanner Service is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "omr-scanner-test",
        "message": "Service is running successfully"
    }

@app.post("/test")
async def test_endpoint():
    return {"message": "Test endpoint working", "status": "success"}

if __name__ == "__main__":
    print("🚀 Starting OMR Scanner Service (Test Version)...")
    print("📍 Service will be available at: http://localhost:8001")
    print("📖 API Documentation: http://localhost:8001/docs")
    print("🔍 Health Check: http://localhost:8001/health")
    
    uvicorn.run("test_app:app", host="0.0.0.0", port=8001, reload=True)
