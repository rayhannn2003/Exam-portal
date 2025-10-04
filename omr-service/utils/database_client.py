"""
Database client for OMR service
Simple HTTP client to communicate with the main backend
"""

import httpx
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class DatabaseClient:
    def __init__(self, backend_url: str = "http://localhost:4000"):
        self.backend_url = backend_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_answer_key(self, exam_id: str, class_id: str) -> Optional[Dict]:
        """Get answer key from main backend"""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/exams/{exam_id}/classes/{class_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "answer_key": data.get("answer_key", {}),
                    "questions": data.get("questions", []),
                    "class_name": data.get("class_name", "")
                }
            else:
                logger.error(f"Failed to get answer key: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting answer key: {str(e)}")
            return None
    
    async def submit_results(self, results_data: Dict) -> bool:
        """Submit OMR results to main backend"""
        try:
            response = await self.client.post(
                f"{self.backend_url}/api/results/submit",
                json=results_data
            )
            
            if response.status_code == 201:
                logger.info("Successfully submitted OMR results")
                return True
            else:
                logger.error(f"Failed to submit results: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error submitting results: {str(e)}")
            return False
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
