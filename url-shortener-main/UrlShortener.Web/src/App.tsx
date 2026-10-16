import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateUrlPage from './pages/CreateUrlPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AdminRoute from './components/AdminRoute';
import AdminStatsPage from './pages/AdminStatsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUrlsPage from './pages/AdminUrlsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/create" element={<ProtectedRoute><CreateUrlPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminStatsPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/urls" element={<AdminRoute><AdminUrlsPage /></AdminRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
