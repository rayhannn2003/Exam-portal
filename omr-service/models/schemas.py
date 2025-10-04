"""
Pydantic models for OMR service
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class AnswerKey(BaseModel):
    """Answer key model"""
    exam_id: str
    class_id: str
    answers: Dict[str, str]  # {"1": "A", "2": "B", ...}
    total_questions: int

class StudentAnswer(BaseModel):
    """Student answer model"""
    question_number: int
    student_answer: str
    correct_answer: str
    is_correct: bool

class OMRProcessingRequest(BaseModel):
    """Request model for OMR processing"""
    exam_id: str = Field(..., description="Exam ID")
    class_id: str = Field(..., description="Class ID")
    answer_key: Dict[str, str] = Field(..., description="Answer key")
    processing_options: Optional[Dict] = Field(default={}, description="Processing options")

class Statistics(BaseModel):
    """Statistics model for OMR processing results"""
    total_questions: int = Field(..., description="Total number of questions")
    answered: int = Field(..., description="Number of questions answered")
    correct: int = Field(..., description="Number of correct answers")
    incorrect: int = Field(..., description="Number of incorrect answers")
    skipped: int = Field(..., description="Number of skipped questions")
    percentage: float = Field(..., description="Percentage score")

class OMRProcessingResponse(BaseModel):
    """Response model for OMR processing"""
    success: bool = Field(..., description="Whether processing was successful")
    roll_number: str = Field(..., description="Decoded roll number")
    student_name: str = Field(default="", description="Student name")
    student_class: str = Field(default="", description="Student class")
    exam_id: str = Field(default="", description="Exam ID")
    class_id: str = Field(default="", description="Class ID")
    student_answers: Dict[str, str] = Field(default={}, description="Student answers")
    statistics: Statistics = Field(..., description="Processing statistics")
    submitted_to_database: bool = Field(default=False, description="Whether results were submitted to database")
    confidence_score: float = Field(..., description="Confidence score (0-100)")
    errors: List[str] = Field(default=[], description="List of errors")

class BatchProcessingRequest(BaseModel):
    """Request model for batch processing"""
    exam_id: str = Field(..., description="Exam ID")
    class_id: str = Field(..., description="Class ID")
    files: List[str] = Field(..., description="List of file paths")

class BatchProcessingResponse(BaseModel):
    """Response model for batch processing"""
    total_files: int = Field(..., description="Total number of files processed")
    successful: int = Field(..., description="Number of successful processing")
    failed: int = Field(..., description="Number of failed processing")
    results: List[OMRProcessingResponse] = Field(..., description="Processing results")
    processing_time: float = Field(..., description="Total processing time")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    timestamp: datetime = Field(..., description="Timestamp")
    version: str = Field(default="1.0.0", description="Service version")

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Error details")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
