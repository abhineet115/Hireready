"""Tests for prompts.py"""
import pytest
from prompts import (
    ats_prompt,
    cover_letter_prompt,
    interview_prompt,
    negotiate_salary_prompt,
    prep_interview_prompt,
    roles_prompt,
    rewrite_resume_prompt,
)


def test_ats_prompt_contains_inputs():
    resume = "Software engineer with Python skills"
    jd = "We need a Python developer"
    result = ats_prompt(resume, jd)
    assert resume in result
    assert jd in result
    assert "score" in result
    assert "matched_keywords" in result
    assert "missing_keywords" in result
    assert "suggestions" in result
    assert "section_breakdown" in result


def test_interview_prompt_contains_inputs():
    result = interview_prompt("Software Engineer", "Senior")
    assert "Software Engineer" in result
    assert "Senior" in result
    assert "questions" in result
    assert "category" in result
    assert "tip" in result


def test_roles_prompt_contains_inputs():
    result = roles_prompt("Data Analyst", ["Python", "SQL", "Tableau"])
    assert "Data Analyst" in result
    assert "Python" in result
    assert "SQL" in result
    assert "roles" in result
    assert "matchPct" in result
    assert "salaryRange" in result


def test_rewrite_resume_prompt_contains_inputs():
    resume = "Managed a team of 5"
    jd = "Looking for a team lead"
    result = rewrite_resume_prompt(resume, jd)
    assert resume in result
    assert jd in result
    assert "rewrites" in result
    assert "original" in result
    assert "rewritten" in result
    assert "reason" in result


def test_negotiate_salary_prompt_contains_inputs():
    result = negotiate_salary_prompt("Engineer", "New York", 120000, "Python, AWS")
    assert "Engineer" in result
    assert "New York" in result
    assert "120,000" in result
    assert "Python, AWS" in result
    assert "market_insight" in result
    assert "scripts" in result
    assert "leverage_tips" in result


def test_prep_interview_prompt_with_resume():
    jd = "Senior React developer role"
    resume = "5 years React experience"
    result = prep_interview_prompt(jd, resume)
    assert jd in result
    assert resume in result
    assert "priority_topics" in result
    assert "practice_questions" in result
    assert "red_flags" in result


def test_prep_interview_prompt_without_resume():
    jd = "Backend engineer role"
    result = prep_interview_prompt(jd, "")
    assert jd in result
    assert "priority_topics" in result


def test_cover_letter_prompt_contains_inputs():
    resume = "Experienced developer"
    jd = "We need a developer"
    result = cover_letter_prompt(resume, jd, "professional")
    assert resume in result
    assert jd in result
    assert "professional" in result
    assert "cover_letter" in result
    assert "subject_line" in result
    assert "key_selling_points" in result
    assert "customization_tips" in result


def test_cover_letter_prompt_default_tone():
    result = cover_letter_prompt("resume", "jd")
    assert "professional" in result


def test_cover_letter_prompt_custom_tone():
    result = cover_letter_prompt("resume", "jd", "enthusiastic")
    assert "enthusiastic" in result
