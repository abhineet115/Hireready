import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted


class KeyRotator:
    def __init__(self):
        raw = os.getenv("GEMINI_API_KEYS", "")
        self._keys = [k.strip() for k in raw.split(",") if k.strip()]
        self._index = 0

    def get_key(self):
        if not self._keys:
            raise ValueError("No Gemini API keys configured")
        key = self._keys[self._index]
        self._index = (self._index + 1) % len(self._keys)
        return key

    def key_count(self):
        return len(self._keys)


def call_gemini(prompt: str, rotator: KeyRotator, max_retries: int = 3) -> str:
    last_error = None
    for attempt in range(max_retries):
        try:
            key = rotator.get_key()
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            return response.text
        except ResourceExhausted as e:
            last_error = e
            continue
        except Exception as e:
            # On non-quota errors, re-raise immediately
            raise e
    raise last_error
