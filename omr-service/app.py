"""
OMR Scanner Microservice
FastAPI-based service for processing OMR sheets
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import cv2
import numpy as np
from imutils import contours
import logging
import os
import tempfile
from datetime import datetime
import httpx
import json

# Import your existing OMR processing functions
from services.omr_processor_improved import ImprovedOMRProcessor
from models.schemas import AnswerKey, StudentAnswer, OMRProcessingRequest, OMRProcessingResponse, Statistics
from utils.database_client import DatabaseClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OMR Scanner Service",
    description="Microservice for processing OMR exam sheets",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
omr_processor = ImprovedOMRProcessor()
db_client = DatabaseClient()

# Models are now imported from schemas.py

@app.post("/process-omr", response_model=OMRProcessingResponse)
async def process_omr_sheet(
    file: UploadFile = File(...),
    exam_id: str = Form(...),
    class_id: str = Form(...)
):
    """
    Process an uploaded OMR sheet and return grading results
    """
    start_time = datetime.now()
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Process OMR sheet with integrated scoring
            result = await omr_processor.process_sheet(
                image_path=tmp_file_path,
                exam_id=exam_id,
                class_id=class_id
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Prepare response with comprehensive statistics
            response = OMRProcessingResponse(
                success=result['success'],
                roll_number=result['roll_number'],
                student_name=result.get('student_name', ''),
                student_class=result.get('student_class', ''),
                exam_id=result.get('exam_id', ''),
                class_id=result.get('class_id', ''),
                student_answers=result['student_answers'],
                statistics=Statistics(**result['statistics']),
                submitted_to_database=result.get('submitted_to_database', False),
                confidence_score=result['confidence_score'],
                errors=result['errors']
            )
            
            logger.info(f"Detected roll number: {result['roll_number']}")
            logger.info(f"Student: {result.get('student_name', 'Unknown')} (Class: {result.get('student_class', 'Unknown')})")
            logger.info(f"Statistics: {result['statistics']}")
            
            return response
            
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
    except Exception as e:
        logger.error(f"Error processing OMR sheet: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Backend submission is now handled directly in the OMR processor

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "omr-scanner", "timestamp": datetime.now().isoformat()}

@app.get("/answer-keys/{exam_id}/{class_id}")
async def get_answer_key(exam_id: str, class_id: str):
    """
    Retrieve answer key from main backend
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:4000/api/exams/{exam_id}/classes/{class_id}")
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "exam_id": exam_id,
                    "class_id": class_id,
                    "answer_key": data.get("answer_key", {}),
                    "questions": data.get("questions", [])
                }
            else:
                raise HTTPException(status_code=404, detail="Answer key not found")
                
    except Exception as e:
        logger.error(f"Error fetching answer key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch answer key")

@app.post("/batch-process")
async def batch_process_omr_sheets(
    files: List[UploadFile] = File(...),
    exam_id: str = None,
    class_id: str = None
):
    """
    Process multiple OMR sheets in batch
    """
    results = []
    
    for file in files:
        try:
            # Get answer key for this exam/class
            answer_key_response = await get_answer_key(exam_id, class_id)
            answer_key = answer_key_response["answer_key"]
            
            # Process each sheet
            request_data = OMRProcessingRequest(
                exam_id=exam_id,
                class_id=class_id,
                answer_key=answer_key
            )
            
            result = await process_omr_sheet(file, request_data)
            results.append({
                "filename": file.filename,
                "result": result
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"batch_results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
