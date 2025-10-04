#!/usr/bin/env python3
"""
OMR Service Startup Script
Simple script to start the OMR service for testing
"""

import uvicorn
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting OMR Scanner Service...")
    print("📍 Service will be available at: http://localhost:8001")
    print("📖 API Documentation: http://localhost:8001/docs")
    print("🔍 Health Check: http://localhost:8001/health")
    print("\n" + "="*50)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
