import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── api.js tests ──────────────────────────────────────────────────
// We test the module in isolation by mocking fetch

describe('api service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset the BACKEND_OFFLINE flag between tests by re-importing
  });

  it('analyzeAts calls the correct endpoint', async () => {
    const mockData = { score: 85, matched_keywords: [], missing_keywords: [], suggestions: [] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { analyzeAts } = await import('../services/api.js');
    const result = await analyzeAts('resume text', 'job description', 'fake-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analyze-ats'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
    expect(result.score).toBe(85);
  });

  it('predictInterview calls the correct endpoint', async () => {
    const mockData = { questions: [] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { predictInterview } = await import('../services/api.js');
    const result = await predictInterview('Engineer', 'Senior', null);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/predict-interview'),
      expect.anything()
    );
    expect(result).toEqual(mockData);
  });

  it('generateCoverLetter calls the PRO endpoint', async () => {
    const mockData = { cover_letter: 'Dear...', subject_line: 'Application', key_selling_points: [], customization_tips: [] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { generateCoverLetter } = await import('../services/api.js');
    const result = await generateCoverLetter('resume', 'jd', 'professional', 'token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/pro/cover-letter'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.cover_letter).toBe('Dear...');
  });

  it('throws an error when the server returns non-ok status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    });

    const { checkHealth } = await import('../services/api.js');
    await expect(checkHealth()).rejects.toThrow('Unauthorized');
  });

  it('sets BACKEND_OFFLINE when fetch throws a TypeError', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { checkHealth, isBackendOffline } = await import('../services/api.js');
    await expect(checkHealth()).rejects.toThrow();
    expect(isBackendOffline()).toBe(true);
  });
});
