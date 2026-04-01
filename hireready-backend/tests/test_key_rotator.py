"""Tests for key_rotator.py"""
import os
import pytest
from unittest.mock import MagicMock, patch


def test_key_rotator_no_keys(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", "")
    from key_rotator import KeyRotator
    rotator = KeyRotator()
    with pytest.raises(ValueError, match="No Gemini API keys configured"):
        rotator.get_key()


def test_key_rotator_single_key(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", "key-abc")
    from key_rotator import KeyRotator
    rotator = KeyRotator()
    assert rotator.key_count() == 1
    assert rotator.get_key() == "key-abc"
    # Wraps around
    assert rotator.get_key() == "key-abc"


def test_key_rotator_multiple_keys(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", "key1,key2,key3")
    from key_rotator import KeyRotator
    rotator = KeyRotator()
    assert rotator.key_count() == 3
    keys = [rotator.get_key() for _ in range(6)]
    assert keys == ["key1", "key2", "key3", "key1", "key2", "key3"]


def test_key_rotator_strips_whitespace(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", " key1 , key2 ")
    from key_rotator import KeyRotator
    rotator = KeyRotator()
    assert rotator.key_count() == 2
    assert rotator.get_key() == "key1"
    assert rotator.get_key() == "key2"


def test_call_gemini_success(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", "fake-key")
    from key_rotator import KeyRotator, call_gemini

    mock_response = MagicMock()
    mock_response.text = '{"score": 85}'

    with patch("key_rotator.genai") as mock_genai:
        mock_client = MagicMock()
        mock_genai.Client.return_value = mock_client
        mock_client.models.generate_content.return_value = mock_response

        rotator = KeyRotator()
        result = call_gemini("test prompt", rotator)
        assert result == '{"score": 85}'


def test_call_gemini_retries_on_quota_exceeded(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEYS", "key1,key2")
    from google.api_core.exceptions import ResourceExhausted
    from key_rotator import KeyRotator, call_gemini

    mock_response = MagicMock()
    mock_response.text = "success"

    call_count = {"n": 0}

    def side_effect(*args, **kwargs):
        call_count["n"] += 1
        if call_count["n"] < 2:
            raise ResourceExhausted("quota")
        return mock_response

    with patch("key_rotator.genai") as mock_genai:
        mock_client = MagicMock()
        mock_genai.Client.return_value = mock_client
        mock_client.models.generate_content.side_effect = side_effect

        rotator = KeyRotator()
        result = call_gemini("test prompt", rotator, max_retries=3)
        assert result == "success"
        assert call_count["n"] == 2
