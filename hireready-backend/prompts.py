def ats_prompt(resume_text: str, job_description: str) -> str:
    return f"""Analyze this resume against the job description and return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Resume:
{resume_text}

Job Description:
{job_description}

Return this exact JSON structure:
{{
  "score": <integer 0-100>,
  "matched_keywords": [<list of strings>],
  "missing_keywords": [<list of strings>],
  "suggestions": [<list of 5 actionable suggestion strings>],
  "section_breakdown": {{
    "contact": {{"score": <0-100>, "feedback": "<string>"}},
    "experience": {{"score": <0-100>, "feedback": "<string>"}},
    "skills": {{"score": <0-100>, "feedback": "<string>"}},
    "education": {{"score": <0-100>, "feedback": "<string>"}},
    "formatting": {{"score": <0-100>, "feedback": "<string>"}}
  }}
}}"""


def interview_prompt(job_title: str, experience_level: str) -> str:
    return f"""Generate 5 interview questions for a {job_title} position at {experience_level} level. Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Return this exact JSON structure:
{{
  "questions": [
    {{
      "category": "<one of: Behavioral, Technical, Situational>",
      "question": "<interview question>",
      "tip": "<short answering tip>"
    }}
  ]
}}

Include a mix of Behavioral, Technical, and Situational questions relevant to the role."""


def roles_prompt(current_title: str, skills: list) -> str:
    skills_str = ", ".join(skills)
    return f"""Recommend 3 career roles for someone with title "{current_title}" and skills: {skills_str}. Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Return this exact JSON structure:
{{
  "roles": [
    {{
      "title": "<role title>",
      "description": "<2-3 sentence description>",
      "matchPct": <integer 60-95>,
      "salaryRange": "<e.g. $80,000 - $120,000>",
      "demand": "<one of: High, Medium, Low>",
      "skillsToBuild": [<list of 3-5 skill strings>],
      "why": "<2-3 sentences explaining why this role fits>"
    }}
  ]
}}

Order by matchPct descending."""


def rewrite_resume_prompt(resume_text: str, job_description: str) -> str:
    return f"""Rewrite resume bullet points to better match this job description. Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Resume:
{resume_text}

Job Description:
{job_description}

Return this exact JSON structure:
{{
  "summary": "<2-3 sentences overall assessment and approach>",
  "rewrites": [
    {{
      "original": "<original bullet point>",
      "rewritten": "<improved version>",
      "reason": "<why this change helps>"
    }}
  ]
}}

Provide 5-8 rewritten bullet points focusing on quantifiable achievements and keywords from the job description."""


def negotiate_salary_prompt(job_title: str, location: str, target_salary: float, skills: str) -> str:
    return f"""Generate salary negotiation advice for: {job_title} in {location}, target salary ${target_salary:,.0f}, skills/accomplishments: {skills}. Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Return this exact JSON structure:
{{
  "market_insight": "<2-3 sentences about market rates and positioning>",
  "scripts": [
    {{
      "scenario": "<scenario name, e.g. Initial offer response>",
      "script": "<full negotiation script paragraph>"
    }}
  ],
  "leverage_tips": [<list of 5-7 actionable leverage tip strings>]
}}

Include exactly 3 scripts: initial offer response, email follow-up, and final negotiation ask."""


def prep_interview_prompt(job_description: str, resume_text: str) -> str:
    resume_section = f"\nCandidate Resume:\n{resume_text}" if resume_text else ""
    return f"""Create a comprehensive interview prep guide based on this job description.{resume_section}

Job Description:
{job_description}

Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Return this exact JSON structure:
{{
  "priority_topics": [
    {{
      "topic": "<topic name>",
      "importance": "<one of: High, Medium, Low>",
      "reason": "<why this topic matters for this role>"
    }}
  ],
  "practice_questions": [
    {{
      "question": "<likely interview question>",
      "concepts": [<list of key concept strings to address>],
      "model_answer": "<2-3 sentence model answer framework>"
    }}
  ],
  "red_flags": [<list of potential concern strings to address proactively>],
  "projects_to_mention": [<list of project/experience strings to mention>]
}}

Include 4-6 priority_topics, 5-7 practice_questions, 3-5 red_flags, and 3-5 projects_to_mention."""


def cover_letter_prompt(resume_text: str, job_description: str, tone: str = "professional") -> str:
    return f"""Write a tailored cover letter based on the resume and job description below. Tone: {tone}.

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation.

Return this exact JSON structure:
{{
  "subject_line": "<email subject line for the application>",
  "cover_letter": "<full cover letter text, 3-4 paragraphs, ready to send>",
  "key_selling_points": [<list of 4-5 strings highlighting why the candidate is a strong fit>],
  "customization_tips": [<list of 3 strings suggesting further personalizations>]
}}

The cover letter should be concise (300-400 words), compelling, and specifically address the job requirements."""
