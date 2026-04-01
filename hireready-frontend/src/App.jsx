import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Eagerly loaded (above-the-fold / free tools)
import Home               from './pages/Home';
import AtsScorer          from './pages/AtsScorer';
import InterviewPredictor from './pages/InterviewPredictor';
import RoleRecommender    from './pages/RoleRecommender';
import Dashboard          from './pages/Dashboard';
import NotFound           from './pages/NotFound';

// Lazily loaded (PRO tools + checkout)
const ResumeRewriter   = lazy(() => import('./pages/ResumeRewriter'));
const SalaryNegotiator = lazy(() => import('./pages/SalaryNegotiator'));
const AdvancedPrep     = lazy(() => import('./pages/AdvancedPrep'));
const CoverLetter      = lazy(() => import('./pages/CoverLetter'));
const History          = lazy(() => import('./pages/History'));
const CheckoutSuccess  = lazy(() => import('./pages/CheckoutSuccess'));
const CheckoutCancel   = lazy(() => import('./pages/CheckoutCancel'));

function PageLoader() {
  return (
    <div style={{ paddingTop: '6rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index                      element={<Home />} />
        <Route path="ats-scorer"          element={<AtsScorer />} />
        <Route path="interview-predictor" element={<InterviewPredictor />} />
        <Route path="role-recommender"    element={<RoleRecommender />} />
        <Route path="dashboard"           element={<Dashboard />} />
        <Route path="resume-rewriter"     element={<Suspense fallback={<PageLoader />}><ResumeRewriter /></Suspense>} />
        <Route path="salary-negotiator"   element={<Suspense fallback={<PageLoader />}><SalaryNegotiator /></Suspense>} />
        <Route path="advanced-prep"       element={<Suspense fallback={<PageLoader />}><AdvancedPrep /></Suspense>} />
        <Route path="cover-letter"        element={<Suspense fallback={<PageLoader />}><CoverLetter /></Suspense>} />
        <Route path="history"             element={<Suspense fallback={<PageLoader />}><History /></Suspense>} />
        <Route path="checkout/success"    element={<Suspense fallback={<PageLoader />}><CheckoutSuccess /></Suspense>} />
        <Route path="checkout/cancel"     element={<Suspense fallback={<PageLoader />}><CheckoutCancel /></Suspense>} />
        <Route path="*"                   element={<NotFound />} />
      </Route>
    </Routes>
  );
}

