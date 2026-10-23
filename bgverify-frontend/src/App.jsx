import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Portal Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import ReviewQueuePage from './pages/admin/ReviewQueuePage';
import AdminOrganizationsPage from './pages/admin/AdminOrganizationsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';

// Company (HR) Portal Pages
import CompanyDashboardPage from './pages/company/CompanyDashboardPage';
import CompanyVerificationsPage from './pages/company/CompanyVerificationsPage';
import CandidatesPage from './pages/company/CandidatesPage';
import CompanyReviewQueuePage from './pages/company/CompanyReviewQueuePage';
import CompanyWalletPage from './pages/company/CompanyWalletPage';

// Candidate Portal Pages
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage';
import CandidateTasksPage from './pages/candidate/CandidateTasksPage';
import CandidateDocumentsPage from './pages/candidate/CandidateDocumentsPage';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading BGVerify...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (['org_owner', 'hr_admin', 'hr_executive'].includes(user?.role)) {
    return <Navigate to="/company" replace />;
  }
  return <Navigate to="/candidate" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2035',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="verifications" element={<AdminVerificationsPage />} />
            <Route path="review" element={<ReviewQueuePage />} />
            <Route path="organizations" element={<AdminOrganizationsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>

          {/* Company (HR) Portal */}
          <Route
            path="/company"
            element={
              <ProtectedRoute roles={['admin', 'org_owner', 'hr_admin', 'hr_executive']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CompanyDashboardPage />} />
            <Route path="verifications" element={<CompanyVerificationsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="review" element={<CompanyReviewQueuePage />} />
            <Route path="wallet" element={<CompanyWalletPage />} />
          </Route>

          {/* Candidate Portal */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute roles={['candidate', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CandidateDashboardPage />} />
            <Route path="tasks" element={<CandidateTasksPage />} />
            <Route path="documents" element={<CandidateDocumentsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
