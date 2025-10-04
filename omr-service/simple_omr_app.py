"""
Simple OMR Service - Working Version
Focuses on your exact workflow requirements
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import cv2
import numpy as np
from imutils import contours
import logging
import os
import tempfile
from datetime import datetime
import httpx
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OMR Scanner Service",
    description="Simple OMR scanner for exam portal",
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

# Your existing OMR processing logic
class SimpleOMRProcessor:
    def __init__(self):
        self.choice_map = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}
    
    def process_omr_sheet(self, image_path: str, answer_key: Dict[str, str]) -> Dict:
        """
        Process OMR sheet using your existing logic
        """
        try:
            # Load image
            original_image = cv2.imread(image_path)
            if original_image is None:
                return self._error_response("Could not load image")
            
            # Find fiducial markers
            corners = self._find_fiducial_markers(original_image)
            if corners is None:
                return self._error_response("Could not find fiducial markers")
            
            # Apply perspective correction
            paper = self._four_point_transform(original_image, corners)
            
            # Split sections
            roll_section, mcq_sections = self._split_sections(paper)
            
            # Decode roll number
            roll_number = self._decode_roll_number(roll_section)
            
            # Process MCQ sections
            student_answers, correct_count = self._process_mcq_sections(mcq_sections, answer_key)
            
            # Calculate results
            total_questions = len(answer_key)
            percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
            confidence_score = self._calculate_confidence(student_answers, answer_key, roll_number)
            
            return {
                "success": True,
                "roll_number": roll_number,
                "student_answers": student_answers,
                "score": correct_count,
                "percentage": round(percentage, 2),
                "correct_count": correct_count,
                "total_questions": total_questions,
                "confidence_score": confidence_score,
                "errors": []
            }
            
        except Exception as e:
            logger.error(f"Error processing OMR sheet: {str(e)}")
            return self._error_response(f"Processing error: {str(e)}")
    
    def _find_fiducial_markers(self, image):
        """Find fiducial markers - Your existing logic"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blurred, 200, 255, cv2.THRESH_BINARY_INV)
        cnts, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        marker_contours = []
        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            aspect_ratio = w / float(h)
            area = cv2.contourArea(c)
            if 0.8 <= aspect_ratio <= 1.2 and 100 < area < 10000:
                marker_contours.append(c)
        if len(marker_contours) < 4:
            return None
        marker_contours = sorted(marker_contours, key=cv2.contourArea, reverse=True)[:4]
        points = []
        for c in marker_contours:
            M = cv2.moments(c)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
                points.append([cX, cY])
            else:
                (x, y, w, h) = cv2.boundingRect(c)
                points.append([x + w // 2, y + h // 2])
        if len(points) != 4:
            return None
        return self._reorder_points(np.array(points, dtype="float32"))
    
    def _reorder_points(self, myPoints):
        """Reorder points - Your existing logic"""
        myPoints = myPoints.reshape((4, 2))
        myPointsNew = np.zeros((4, 2), np.float32)
        add = myPoints.sum(1)
        myPointsNew[0] = myPoints[np.argmin(add)]
        myPointsNew[3] = myPoints[np.argmax(add)]
        diff = np.diff(myPoints, axis=1)
        myPointsNew[1] = myPoints[np.argmin(diff)]
        myPointsNew[2] = myPoints[np.argmax(diff)]
        return myPointsNew
    
    def _four_point_transform(self, image, pts):
        """Perspective transform - Your existing logic"""
        (tl, tr, bl, br) = pts
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))
        dst = np.array([[0, 0], [maxWidth - 1, 0], [0, maxHeight - 1], [maxWidth - 1, maxHeight - 1]], dtype="float32")
        matrix = cv2.getPerspectiveTransform(pts, dst)
        return cv2.warpPerspective(image, matrix, (maxWidth, maxHeight))
    
    def _split_sections(self, paper):
        """Split into roll and MCQ sections - Your existing logic"""
        h_paper, w_paper = paper.shape[:2]
        crop_margin_top = int(h_paper * 0.03)
        crop_margin_bottom = int(h_paper * 0.03)
        crop_margin_x = int(w_paper * 0.05)
        cropped_paper = paper[crop_margin_top:h_paper - crop_margin_bottom, crop_margin_x:]
        h_crop, w_crop, _ = cropped_paper.shape
        split_y = int(h_crop * 0.22)  # Simplified split
        roll_section = cropped_paper[0:split_y, :]
        mcq_section_full = cropped_paper[split_y:, :]
        # Split into 4 equal sections for now
        section_width = w_crop // 4
        mcq_sections = [
            mcq_section_full[:, :section_width],
            mcq_section_full[:, section_width:2*section_width],
            mcq_section_full[:, 2*section_width:3*section_width],
            mcq_section_full[:, 3*section_width:]
        ]
        return roll_section, mcq_sections
    
    def _decode_roll_number(self, roll_section):
        """Decode roll number - Your existing logic"""
        if roll_section is None or roll_section.size == 0:
            return "N/A"
        
        h, w = roll_section.shape[:2]
        crop_y_start = int(h * 0.315)
        bubble_area = roll_section[crop_y_start:, :]
        gray = cv2.cvtColor(bubble_area, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)[1]
        cnts, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        bubble_contours = []
        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            ar = w / float(h)
            if 10 < w < 50 and 10 < h < 50 and 0.7 <= ar <= 1.3:
                bubble_contours.append(c)
        
        if len(bubble_contours) < 50:
            return "Not Enough Bubbles Found"
        
        # Simplified roll number decoding
        bubble_contours, _ = contours.sort_contours(bubble_contours, method="left-to-right")
        columns = []
        current_column = [bubble_contours[0]]
        avg_bubble_width = np.mean([cv2.boundingRect(c)[2] for c in bubble_contours])
        
        for i in range(1, len(bubble_contours)):
            prev_x, _, prev_w, _ = cv2.boundingRect(bubble_contours[i-1])
            curr_x, _, _, _ = cv2.boundingRect(bubble_contours[i])
            if (curr_x - (prev_x + prev_w)) > (avg_bubble_width * 0.4):
                columns.append(current_column)
                current_column = [bubble_contours[i]]
            else:
                current_column.append(bubble_contours[i])
        columns.append(current_column)
        
        if len(columns) == 6:
            bubble_columns = columns[1:]
        elif len(columns) == 5:
            bubble_columns = columns
        else:
            return "Column Count Error"
        
        decoded_roll = []
        all_bubble_intensities = [cv2.mean(gray, mask=cv2.drawContours(np.zeros(gray.shape, dtype="uint8"), [c], -1, 255, -1))[0] for c in bubble_contours]
        grading_threshold = self._get_intensity_threshold(all_bubble_intensities)
        
        for column in bubble_columns:
            column_sorted, _ = contours.sort_contours(column, method="top-to-bottom")
            if not (9 <= len(column_sorted) <= 11):
                decoded_roll.append("X")
                continue
            
            marked_count = 0
            marked_digit = -1
            for i, bubble_c in enumerate(column_sorted):
                mask = np.zeros(gray.shape, dtype="uint8")
                cv2.drawContours(mask, [bubble_c], -1, 255, -1)
                if cv2.mean(gray, mask=mask)[0] < grading_threshold:
                    marked_digit = i
                    marked_count += 1
            
            if marked_count == 1:
                decoded_roll.append(str(marked_digit))
            else:
                decoded_roll.append("E")
        
        return "".join(decoded_roll)
    
    def _get_intensity_threshold(self, intensities, min_jump=15):
        """Get intensity threshold - Your existing logic"""
        if not intensities:
            return 150
        intensities.sort()
        jumps = [(intensities[i + 1] - intensities[i], i) for i in range(len(intensities) - 1)]
        if not jumps:
            return np.mean(intensities) if intensities else 150
        best_jump, best_index = max(jumps, key=lambda item: item[0])
        if best_jump > min_jump:
            return intensities[best_index] + best_jump / 2
        else:
            return np.mean(intensities) - 5
    
    def _process_mcq_sections(self, mcq_sections, answer_key):
        """Process MCQ sections - Your existing logic"""
        all_answers = {}
        total_correct = 0
        
        for section_idx, section in enumerate(mcq_sections):
            section_answers, section_correct = self._process_single_mcq_section(
                section, section_idx * 15, answer_key
            )
            all_answers.update(section_answers)
            total_correct += section_correct
        
        return all_answers, total_correct
    
    def _process_single_mcq_section(self, section, question_offset, answer_key):
        """Process single MCQ section - Your existing logic"""
        if section is None or section.size == 0:
            return {}, 0
        
        gray = cv2.cvtColor(section, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)[1]
        cnts, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        all_contours = []
        
        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            ar = w / float(h)
            if 10 < w < 60 and 10 < h < 60 and 0.2 < ar < 2.0:
                all_contours.append(c)
        
        if len(all_contours) < 60:
            return {}, 0
        
        all_contours, _ = contours.sort_contours(all_contours, method="left-to-right")
        columns = []
        current_column = [all_contours[0]]
        avg_contour_width = np.mean([cv2.boundingRect(c)[2] for c in all_contours])
        gap_threshold = avg_contour_width * 0.3
        
        for i in range(1, len(all_contours)):
            prev_x, _, prev_w, _ = cv2.boundingRect(all_contours[i-1])
            curr_x, _, _, _ = cv2.boundingRect(all_contours[i])
            if (curr_x - (prev_x + prev_w)) > gap_threshold:
                columns.append(current_column)
                current_column = [all_contours[i]]
            else:
                current_column.append(all_contours[i])
        columns.append(current_column)
        
        if len(columns) == 5:
            bubble_columns = columns[1:]
        elif len(columns) == 4:
            bubble_columns = columns
        else:
            return {}, 0
        
        section_answers = {}
        section_correct = 0
        all_bubble_intensities = [cv2.mean(gray, mask=cv2.drawContours(np.zeros(gray.shape, dtype="uint8"), [c], -1, 255, -1))[0] for col in bubble_columns for c in col]
        grading_threshold = self._get_intensity_threshold(all_bubble_intensities)
        all_bubbles_in_section = [c for col in bubble_columns for c in col]
        question_rows = self._group_bubbles_into_rows(all_bubbles_in_section, tolerance=20)
        
        for row_idx, row in enumerate(question_rows):
            question_num = question_offset + row_idx
            if len(row) != 4:
                continue
            
            question_bubbles = contours.sort_contours(row, method="left-to-right")[0]
            marked_choice_idx = -1
            marked_count = 0
            
            for choice_idx, bubble_contour in enumerate(question_bubbles):
                mask = cv2.drawContours(np.zeros(gray.shape, dtype="uint8"), [bubble_contour], -1, 255, -1)
                if cv2.mean(gray, mask=mask)[0] < grading_threshold:
                    marked_choice_idx = choice_idx
                    marked_count += 1
            
            is_correct = False
            correct_answers = answer_key.get(str(question_num + 1))
            
            if marked_count == 1 and correct_answers:
                if isinstance(correct_answers, list) and marked_choice_idx in correct_answers:
                    is_correct = True
                elif marked_choice_idx == correct_answers:
                    is_correct = True
            
            if is_correct:
                section_correct += 1
            
            student_answer_char = self.choice_map.get(marked_choice_idx, 'Blank') if marked_count == 1 else ('Error' if marked_count > 1 else 'Blank')
            section_answers[str(question_num + 1)] = student_answer_char
        
        return section_answers, section_correct
    
    def _group_bubbles_into_rows(self, bubbles, tolerance=10):
        """Group bubbles into rows - Your existing logic"""
        if not bubbles:
            return []
        bubbles = contours.sort_contours(bubbles, method="top-to-bottom")[0]
        rows = []
        current_row = [bubbles[0]]
        for i in range(1, len(bubbles)):
            (x, y, w, h) = cv2.boundingRect(bubbles[i])
            (prev_x, prev_y, prev_w, prev_h) = cv2.boundingRect(current_row[0])
            if abs(y - prev_y) < tolerance:
                current_row.append(bubbles[i])
            else:
                rows.append(current_row)
                current_row = [bubbles[i]]
        rows.append(current_row)
        return rows
    
    def _calculate_confidence(self, student_answers, answer_key, roll_number):
        """Calculate confidence score"""
        confidence_factors = []
        
        # Roll number confidence
        if roll_number and roll_number.isdigit() and len(roll_number) == 5:
            confidence_factors.append(100)
        elif roll_number and roll_number != 'ERROR' and roll_number != 'N/A':
            confidence_factors.append(50)
        else:
            confidence_factors.append(0)
        
        # Answer detection confidence
        if student_answers:
            total_questions = len(answer_key)
            answered_questions = len(student_answers)
            answer_confidence = (answered_questions / total_questions) * 100 if total_questions > 0 else 0
            confidence_factors.append(answer_confidence)
        else:
            confidence_factors.append(0)
        
        return sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.0
    
    def _error_response(self, error_message: str):
        """Return error response"""
        return {
            "success": False,
            "roll_number": "ERROR",
            "student_answers": {},
            "score": 0,
            "percentage": 0.0,
            "correct_count": 0,
            "total_questions": 0,
            "confidence_score": 0.0,
            "errors": [error_message]
        }

# Initialize processor
omr_processor = SimpleOMRProcessor()

@app.get("/")
async def root():
    return {"message": "OMR Scanner Service is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "omr-scanner",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/process-omr")
async def process_omr_sheet(
    file: UploadFile = File(...),
    exam_id: str = None,
    class_id: str = None
):
    """
    Process OMR sheet - Your exact workflow
    """
    start_time = datetime.now()
    
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Get answer key from backend
            answer_key = {}
            if exam_id and class_id:
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(f"http://localhost:4000/api/exams/{exam_id}/classes/{class_id}")
                        if response.status_code == 200:
                            data = response.json()
                            answer_key = data.get("answer_key", {})
                except Exception as e:
                    logger.error(f"Error getting answer key: {str(e)}")
            
            # Process OMR sheet
            result = omr_processor.process_omr_sheet(tmp_file_path, answer_key)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            result["processing_time"] = processing_time
            
            # Submit to backend if successful
            if result['success'] and result['roll_number'] and result['roll_number'].isdigit():
                try:
                    async with httpx.AsyncClient() as client:
                        submit_data = {
                            "roll_number": result['roll_number'],
                            "answers": result['student_answers'],
                            "submitted_by": "OMR_Scanner"
                        }
                        response = await client.post(
                            "http://localhost:4000/api/results/submit",
                            json=submit_data,
                            headers={"Content-Type": "application/json"}
                        )
                        if response.status_code == 201:
                            logger.info(f"Successfully submitted OMR results for roll {result['roll_number']}")
                        else:
                            logger.error(f"Failed to submit OMR results: {response.text}")
                except Exception as e:
                    logger.error(f"Error submitting to backend: {str(e)}")
            
            return result
            
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
    except Exception as e:
        logger.error(f"Error processing OMR sheet: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple OMR Scanner Service...")
    print("📍 Service will be available at: http://localhost:8001")
    print("📖 API Documentation: http://localhost:8001/docs")
    print("🔍 Health Check: http://localhost:8001/health")
    
    uvicorn.run("simple_omr_app:app", host="0.0.0.0", port=8001, reload=True)
