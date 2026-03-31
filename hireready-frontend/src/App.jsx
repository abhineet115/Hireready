import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home               from './pages/Home';
import AtsScorer          from './pages/AtsScorer';
import InterviewPredictor from './pages/InterviewPredictor';
import RoleRecommender    from './pages/RoleRecommender';
import Dashboard          from './pages/Dashboard';
import ResumeRewriter     from './pages/ResumeRewriter';
import SalaryNegotiator   from './pages/SalaryNegotiator';
import AdvancedPrep       from './pages/AdvancedPrep';
import NotFound           from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index               element={<Home />} />
        <Route path="ats-scorer"         element={<AtsScorer />} />
        <Route path="interview-predictor" element={<InterviewPredictor />} />
        <Route path="role-recommender"   element={<RoleRecommender />} />
        <Route path="dashboard"          element={<Dashboard />} />
        <Route path="resume-rewriter"    element={<ResumeRewriter />} />
        <Route path="salary-negotiator"  element={<SalaryNegotiator />} />
        <Route path="advanced-prep"      element={<AdvancedPrep />} />
        <Route path="*"                  element={<NotFound />} />
      </Route>
    </Routes>
  );
}
