"""
Pydantic models for question paper data structures
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Literal
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    """Supported question types"""
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    TRUE_FALSE = "true_false"


class PaperSize(str, Enum):
    """Supported paper sizes"""
    A4 = "A4"
    A3 = "A3"
    LEGAL = "Legal"
    LETTER = "Letter"


class Orientation(str, Enum):
    """Page orientation"""
    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"


class MarginType(str, Enum):
    """Margin types"""
    NARROW = "narrow"
    NORMAL = "normal"
    WIDE = "wide"


class FontSize(str, Enum):
    """Font size options"""
    SMALL = "10pt"
    MEDIUM = "11pt"
    LARGE = "12pt"
    XLARGE = "14pt"
    XXLARGE = "16pt"


class Option(BaseModel):
    """Individual option for MCQ questions"""
    key: str = Field(..., description="Option key (A, B, C, D)")
    text: str = Field(..., description="Option text")
    
    @validator('key')
    def validate_key(cls, v):
        if v.upper() not in ['A', 'B', 'C', 'D']:
            raise ValueError('Option key must be A, B, C, or D')
        return v.upper()


class Question(BaseModel):
    """Individual question model"""
    qno: int = Field(..., description="Question number", ge=1)
    question: str = Field(..., description="Question text", min_length=1)
    question_type: QuestionType = Field(default=QuestionType.MCQ, description="Type of question")
    marks: int = Field(default=1, description="Marks for this question", ge=1)
    subject: Optional[str] = Field(None, description="Subject of the question")
    topic: Optional[str] = Field(None, description="Topic of the question")
    options: Optional[Dict[str, str]] = Field(None, description="MCQ options")
    correct_answer: Optional[str] = Field(None, description="Correct answer")
    explanation: Optional[str] = Field(None, description="Explanation for the answer")
    
    @validator('options')
    def validate_options(cls, v, values):
        if values.get('question_type') == QuestionType.MCQ and v is None:
            raise ValueError('MCQ questions must have options')
        return v
    
    @validator('options')
    def validate_option_keys(cls, v):
        if v is not None:
            valid_keys = {'A', 'B', 'C', 'D'}
            if not set(v.keys()).issubset(valid_keys):
                raise ValueError('Option keys must be A, B, C, or D')
        return v


class ExamSet(BaseModel):
    """Exam set containing questions and answer key"""
    set_name: str = Field(..., description="Name of the exam set", min_length=1)
    questions: List[Question] = Field(..., description="List of questions", min_items=1)
    answer_key: Dict[str, str] = Field(..., description="Answer key for questions")
    total_marks: Optional[int] = Field(None, description="Total marks for the set")
    duration_minutes: Optional[int] = Field(None, description="Duration in minutes")
    instructions: Optional[str] = Field(None, description="Special instructions for this set")
    
    @validator('total_marks', always=True)
    def calculate_total_marks(cls, v, values):
        if v is None and 'questions' in values:
            return sum(q.marks for q in values['questions'])
        return v
    
    @validator('answer_key')
    def validate_answer_key(cls, v, values):
        if 'questions' in values:
            question_numbers = {str(q.qno) for q in values['questions']}
            answer_numbers = set(v.keys())
            if not answer_numbers.issubset(question_numbers):
                missing = answer_numbers - question_numbers
                raise ValueError(f'Answer key contains questions not in question list: {missing}')
        return v


class Exam(BaseModel):
    """Exam model containing basic exam information"""
    id: Optional[int] = Field(None, description="Exam ID")
    title: str = Field(..., description="Exam title", min_length=1)
    class_name: str = Field(..., description="Class/grade name", min_length=1)
    year: int = Field(..., description="Exam year", ge=2020, le=2030)
    question_count: int = Field(..., description="Total number of questions", ge=1)
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class HeaderOptions(BaseModel):
    """Header customization options"""
    show_logo: bool = Field(default=True, description="Show organization logo")
    show_title: bool = Field(default=True, description="Show exam title")
    show_class: bool = Field(default=True, description="Show class information")
    show_date: bool = Field(default=True, description="Show exam date")
    show_duration: bool = Field(default=True, description="Show exam duration")
    show_marks: bool = Field(default=True, description="Show total marks")
    show_instructions: bool = Field(default=True, description="Show general instructions")
    organization_name: Optional[str] = Field(None, description="Organization name")
    logo_url: Optional[str] = Field(None, description="Logo URL or path")


class FooterOptions(BaseModel):
    """Footer customization options"""
    show_page_numbers: bool = Field(default=True, description="Show page numbers")
    show_instructions: bool = Field(default=True, description="Show footer instructions")
    custom_text: Optional[str] = Field(None, description="Custom footer text")


class PaperCustomization(BaseModel):
    """Paper customization options"""
    paper_size: PaperSize = Field(default=PaperSize.A4, description="Paper size")
    orientation: Orientation = Field(default=Orientation.PORTRAIT, description="Page orientation")
    font_size: FontSize = Field(default=FontSize.MEDIUM, description="Font size")
    margin_type: MarginType = Field(default=MarginType.NORMAL, description="Margin type")
    header_options: HeaderOptions = Field(default_factory=HeaderOptions, description="Header options")
    footer_options: FooterOptions = Field(default_factory=FooterOptions, description="Footer options")
    custom_css: Optional[str] = Field(None, description="Custom CSS styles")
    watermark: Optional[str] = Field(None, description="Watermark text")
    show_answer_spaces: bool = Field(default=True, description="Show answer spaces for students")


class QuestionPaperRequest(BaseModel):
    """Request model for generating question papers"""
    exam: Exam = Field(..., description="Exam information")
    exam_set: ExamSet = Field(..., description="Exam set with questions")
    template_type: str = Field(default="default", description="Template type to use")
    customization: PaperCustomization = Field(default_factory=PaperCustomization, description="Customization options")
    preview_mode: bool = Field(default=False, description="Generate preview instead of PDF")
    
    class Config:
        schema_extra = {
            "example": {
                "exam": {
                    "title": "Mathematics Final Exam",
                    "class_name": "Class 10",
                    "year": 2024,
                    "question_count": 50
                },
                "exam_set": {
                    "set_name": "Set A",
                    "questions": [
                        {
                            "qno": 1,
                            "question": "What is 2 + 2?",
                            "question_type": "mcq",
                            "marks": 1,
                            "options": {
                                "A": "3",
                                "B": "4",
                                "C": "5",
                                "D": "6"
                            }
                        }
                    ],
                    "answer_key": {
                        "1": "B"
                    }
                },
                "template_type": "default",
                "customization": {
                    "paper_size": "A4",
                    "orientation": "portrait",
                    "font_size": "12pt"
                }
            }
        }


class QuestionPaperResponse(BaseModel):
    """Response model for question paper generation"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    pdf_data: Optional[bytes] = Field(None, description="Generated PDF data (base64 encoded)")
    exam_title: str = Field(..., description="Exam title")
    set_name: str = Field(..., description="Set name")
    total_questions: int = Field(..., description="Total number of questions")
    total_marks: int = Field(..., description="Total marks")
    generated_at: str = Field(..., description="Generation timestamp")
    file_size: Optional[int] = Field(None, description="PDF file size in bytes")
    template_used: Optional[str] = Field(None, description="Template used for generation")
    
    class Config:
        json_encoders = {
            bytes: lambda v: v.decode('utf-8') if isinstance(v, bytes) else v
        }


class TemplateInfo(BaseModel):
    """Template information model"""
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    version: str = Field(..., description="Template version")
    supported_paper_sizes: List[PaperSize] = Field(..., description="Supported paper sizes")
    supported_orientations: List[Orientation] = Field(..., description="Supported orientations")
    features: List[str] = Field(..., description="Template features")
    preview_url: Optional[str] = Field(None, description="Preview URL")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "default",
                "description": "Standard question paper template",
                "version": "1.0.0",
                "supported_paper_sizes": ["A4", "A3"],
                "supported_orientations": ["portrait", "landscape"],
                "features": ["MCQ support", "Answer spaces", "Page numbers"]
            }
        }
