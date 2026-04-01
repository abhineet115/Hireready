import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// We need to mock firebase before importing AuthContext/components
vi.mock('../firebase/config', () => ({
  auth: { onAuthStateChanged: () => () => {} },
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: (auth, cb) => { cb(null); return () => {}; },
  GoogleAuthProvider: vi.fn(),
}));

import Home from '../pages/Home';

describe('Home page', () => {
  it('renders the hero headline', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Land Your Dream Job Faster/i)).toBeInTheDocument();
  });

  it('renders all 7 tool cards', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('ATS Scorer')).toBeInTheDocument();
    expect(screen.getByText('Interview Predictor')).toBeInTheDocument();
    expect(screen.getByText('Role Recommender')).toBeInTheDocument();
    expect(screen.getByText('Resume Rewriter')).toBeInTheDocument();
    expect(screen.getByText('Salary Negotiator')).toBeInTheDocument();
    expect(screen.getByText('Advanced Interview Prep')).toBeInTheDocument();
    expect(screen.getByText('Cover Letter Generator')).toBeInTheDocument();
  });

  it('shows FREE and PRO badges', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const freeBadges = screen.getAllByText('FREE');
    const proBadges = screen.getAllByText('PRO');
    expect(freeBadges.length).toBe(3);
    expect(proBadges.length).toBe(4);
  });

  it('renders CTA buttons', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('View Dashboard')).toBeInTheDocument();
  });
});
