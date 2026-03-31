import os
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
DEV_TEST_TOKEN = os.getenv("DEV_TEST_TOKEN", "hireready-dev-pro-test-2024")
RATE_LIMIT = os.getenv("RATE_LIMIT", "30/minute")
