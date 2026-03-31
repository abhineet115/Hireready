const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
let BACKEND_OFFLINE = false;

async function apiCall(endpoint, options = {}, token = null) {
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try { const j = await res.json(); errMsg = j.detail || j.message || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      BACKEND_OFFLINE = true;
    }
    throw err;
  }
}

export const isBackendOffline = () => BACKEND_OFFLINE;

export async function uploadResume(file, token) {
  const fd = new FormData();
  fd.append('file', file);
  return apiCall('/api/upload-resume', { method: 'POST', body: fd }, token);
}

export async function analyzeAts(resumeText, jobDescription, token) {
  return apiCall('/api/analyze-ats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  }, token);
}

export async function predictInterview(jobTitle, experienceLevel, token) {
  return apiCall('/api/predict-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_title: jobTitle, experience_level: experienceLevel }),
  }, token);
}

export async function recommendRoles(currentTitle, skills, token) {
  return apiCall('/api/recommend-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_title: currentTitle, skills }),
  }, token);
}

export async function rewriteResume(resumeText, jobDescription, token) {
  return apiCall('/api/pro/rewrite-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  }, token);
}

export async function negotiateSalary(jobTitle, location, targetSalary, skills, token) {
  return apiCall('/api/pro/negotiate-salary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_title: jobTitle, location, target_salary: targetSalary, skills }),
  }, token);
}

export async function prepInterview(jobDescription, resumeText, token) {
  return apiCall('/api/pro/prep-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_description: jobDescription, resume_text: resumeText }),
  }, token);
}

export async function getUserUsage(token) {
  return apiCall('/api/user/usage', {}, token);
}

export async function getUserHistory(token) {
  return apiCall('/api/user/history', {}, token);
}

export async function checkHealth() {
  return apiCall('/api/health');
}
