import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import CareerReflectionPage from './pages/CareerReflectionPage';
import CareerReportPage from './pages/CareerReportPage';
import CareerAssistantPage from './pages/CareerAssistantPage';
import { CvReviewerPage, CvReviewDetailPage } from './pages/CvReviewerPages';
import { InterviewPreparationPage, InterviewSessionPage } from './pages/InterviewPages';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import { PrivacyPage, TermsPage, NotFoundPage } from './pages/StaticPages';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Guests can try the reflection; saving requires an account. */}
        <Route path="/career-reflection" element={<CareerReflectionPage />} />
        <Route path="/career-report" element={<CareerReportPage />} />
        <Route path="/career-report/:id" element={<ProtectedRoute><CareerReportPage /></ProtectedRoute>} />

        <Route path="/career-assistant" element={<ProtectedRoute><CareerAssistantPage /></ProtectedRoute>} />
        <Route path="/cv-reviewer" element={<ProtectedRoute><CvReviewerPage /></ProtectedRoute>} />
        <Route path="/cv-reviewer/:id" element={<ProtectedRoute><CvReviewDetailPage /></ProtectedRoute>} />
        <Route path="/interview-preparation" element={<ProtectedRoute><InterviewPreparationPage /></ProtectedRoute>} />
        <Route path="/interview-preparation/:id" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/privasi" element={<PrivacyPage />} />
        <Route path="/syarat" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
