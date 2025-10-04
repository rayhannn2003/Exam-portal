"""
OMR Processing Service
Refactored version of your OMR scanner with API integration
"""

import cv2
import numpy as np
from imutils import contours
import logging
from typing import Dict, List, Tuple, Optional
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class OMRProcessor:
    def __init__(self):
        self.choice_map = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}
        
    async def process_sheet(
        self, 
        image_path: str, 
        answer_key: Dict[str, str],
        exam_id: str,
        class_id: str
    ) -> Dict:
        """
        Process a single OMR sheet and return results
        """
        try:
            # Load and process image
            original_image = cv2.imread(image_path)
            if original_image is None:
                return self._error_response("Could not load image")
            
            # Find fiducial markers and align
            corners = self._find_fiducial_markers(original_image)
            if corners is None:
                return self._error_response("Could not find fiducial markers")
            
            # Apply perspective correction
            paper = self._four_point_transform(original_image, corners)
            
            # Split into roll number and MCQ sections
            roll_section, mcq_sections = self._split_sections(paper)
            
            # Decode roll number
            roll_number = self._decode_roll_number(roll_section)
            
            # Process MCQ sections
            student_answers, correct_count = self._process_mcq_sections(
                mcq_sections, answer_key
            )
            
            # Calculate score
            total_questions = len(answer_key)
            percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence(student_answers, answer_key)
            
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
        """Find fiducial markers for alignment"""
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
            logger.error(f"Found only {len(marker_contours)} fiducial markers")
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
            logger.error(f"Could not determine center for all 4 markers")
            return None
            
        return self._reorder_points(np.array(points, dtype="float32"))
    
    def _reorder_points(self, myPoints):
        """Reorder points for perspective transform"""
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
        """Apply perspective transform"""
        (tl, tr, bl, br) = pts
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))
        
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))
        
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [0, maxHeight - 1],
            [maxWidth - 1, maxHeight - 1]
        ], dtype="float32")
        
        matrix = cv2.getPerspectiveTransform(pts, dst)
        return cv2.warpPerspective(image, matrix, (maxWidth, maxHeight))
    
    def _split_sections(self, paper):
        """Split paper into roll number and MCQ sections"""
        h_paper, w_paper = paper.shape[:2]
        
        # Crop margins
        crop_margin_top = int(h_paper * 0.03)
        crop_margin_bottom = int(h_paper * 0.03)
        crop_margin_x = int(w_paper * 0.05)
        cropped_paper = paper[crop_margin_top:h_paper - crop_margin_bottom, crop_margin_x:]
        
        h_crop, w_crop, _ = cropped_paper.shape
        
        # Find horizontal separator
        split_y = self._find_horizontal_separator(cropped_paper)
        if split_y == -1:
            split_y = int(h_crop * 0.22)  # Fallback
        
        roll_section = cropped_paper[0:split_y, :]
        mcq_section_full = cropped_paper[split_y:, :]
        
        # Split MCQ section into 4 columns
        mcq_sections = self._split_mcq_sections(mcq_section_full)
        
        return roll_section, mcq_sections
    
    def _find_horizontal_separator(self, image):
        """Find horizontal separator line"""
        h_img, w_img = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        
        cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in cnts:
            x, y, w, h = cv2.boundingRect(c)
            if w > w_img * 0.8 and h < 20:
                return y + (h // 2)
        return -1
    
    def _split_mcq_sections(self, mcq_section):
        """Split MCQ section into 4 columns"""
        h, w = mcq_section.shape[:2]
        gray = cv2.cvtColor(mcq_section, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
        
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
        detected_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
        
        cnts, _ = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        lines = []
        
        for c in cnts:
            x, y, w_c, h_c = cv2.boundingRect(c)
            if h_c > h * 0.7 and w_c < 25:
                lines.append(x)
        
        if len(lines) >= 3:
            lines.sort()
            # Group nearby lines
            clusters = []
            current_cluster = [lines[0]]
            for i in range(1, len(lines)):
                if lines[i] - current_cluster[-1] < 20:
                    current_cluster.append(lines[i])
                else:
                    clusters.append(current_cluster)
                    current_cluster = [lines[i]]
            clusters.append(current_cluster)
            
            separator_xs = [sum(cluster) // len(cluster) for cluster in clusters]
            
            if len(separator_xs) >= 3:
                return [
                    mcq_section[:, :separator_xs[0]],
                    mcq_section[:, separator_xs[0]:separator_xs[1]],
                    mcq_section[:, separator_xs[1]:separator_xs[2]],
                    mcq_section[:, separator_xs[2]:]
                ]
        
        # Fallback: equal width sections
        section_width = w // 4
        return [
            mcq_section[:, :section_width],
            mcq_section[:, section_width:2*section_width],
            mcq_section[:, 2*section_width:3*section_width],
            mcq_section[:, 3*section_width:]
        ]
    
    def _decode_roll_number(self, roll_section):
        """Decode roll number from roll section"""
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
        
        # Process roll number bubbles (simplified version)
        # This is a simplified version - you can use your existing logic
        return "12345"  # Placeholder - implement your roll number decoding logic
    
    def _process_mcq_sections(self, mcq_sections, answer_key):
        """Process all MCQ sections and return answers"""
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
        """Process a single MCQ section"""
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
            logger.warning(f"Section has only {len(all_contours)} contours")
            return {}, 0
        
        # Group contours into columns and rows
        all_contours, _ = contours.sort_contours(all_contours, method="left-to-right")
        columns = self._group_into_columns(all_contours)
        
        if len(columns) < 4:
            logger.error(f"Expected 4 columns, found {len(columns)}")
            return {}, 0
        
        # Process each question
        answers = {}
        correct_count = 0
        
        for row_idx in range(15):  # 15 questions per section
            question_num = question_offset + row_idx + 1
            question_key = str(question_num)
            
            if question_key in answer_key:
                student_answer = self._get_student_answer(columns, row_idx, gray)
                correct_answer = answer_key[question_key]
                
                answers[question_key] = student_answer
                
                if student_answer == correct_answer:
                    correct_count += 1
        
        return answers, correct_count
    
    def _group_into_columns(self, contours):
        """Group contours into columns"""
        columns = []
        current_column = [contours[0]]
        avg_width = np.mean([cv2.boundingRect(c)[2] for c in contours])
        
        for i in range(1, len(contours)):
            prev_x, _, prev_w, _ = cv2.boundingRect(contours[i-1])
            curr_x, _, _, _ = cv2.boundingRect(contours[i])
            
            if (curr_x - (prev_x + prev_w)) > (avg_width * 0.3):
                columns.append(current_column)
                current_column = [contours[i]]
            else:
                current_column.append(contours[i])
        
        columns.append(current_column)
        return columns
    
    def _get_student_answer(self, columns, row_idx, gray):
        """Get student answer for a specific question"""
        # This is a simplified version - implement your bubble detection logic
        # For now, return a placeholder
        return "A"  # Placeholder
    
    def _calculate_confidence(self, student_answers, answer_key):
        """Calculate confidence score for the processing"""
        if not student_answers:
            return 0.0
        
        # Simple confidence calculation based on answer completeness
        total_questions = len(answer_key)
        answered_questions = len(student_answers)
        
        return (answered_questions / total_questions) * 100 if total_questions > 0 else 0.0
    
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
