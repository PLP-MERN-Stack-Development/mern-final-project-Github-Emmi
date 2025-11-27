// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from './hooks/useSocket';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import StudentDashboard from './pages/student/Dashboard';
import TutorDashboard from './pages/tutor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import MyCoursesPage from './pages/courses/MyCoursesPage';
import CourseCreatePage from './pages/courses/CourseCreatePage';
import AchievementsPage from './pages/student/AchievementsPage';
import CommunityFeedPage from './pages/community/FeedPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/profile/ProfilePage';

// Assignment Pages
import AssignmentListPage from './pages/assignments/AssignmentListPage';
import AssignmentCreatePage from './pages/assignments/AssignmentCreatePage';
import AssignmentSubmitPage from './pages/assignments/AssignmentSubmitPage';
import AssignmentGradingPage from './pages/assignments/AssignmentGradingPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import AssignmentSubmissionsPage from './pages/assignments/AssignmentSubmissionsPage';

// Admin Pages
import UsersPage from './pages/admin/UsersPage';
import CoursesAdminPage from './pages/admin/CoursesPage';
import AssignmentsAdminPage from './pages/admin/AssignmentsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import FeedModerationPage from './pages/admin/FeedModerationPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import ConnectionStatus from './components/ConnectionStatus';
import AIAssistant from './components/AIAssistant';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Initialize socket connection for authenticated users
  useSocket();

  const getDashboardByRole = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'tutor':
        return '/tutor/dashboard';
      case 'admin':
      case 'superadmin':
        return '/admin/dashboard';
      default:
        return '/courses';
    }
  };

  return (
    <div className="App">
      <ConnectionStatus />
      {isAuthenticated && <AIAssistant />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getDashboardByRole()} /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to={getDashboardByRole()} /> : <RegisterPage />} 
        />
        
        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        
        {/* Courses - With sidebar when authenticated */}
        <Route 
          path="/courses" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <CoursesPage />
              </DashboardLayout>
            ) : (
              <CoursesPage />
            )
          } 
        />
        <Route 
          path="/courses/:id" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <CourseDetailPage />
              </DashboardLayout>
            ) : (
              <CourseDetailPage />
            )
          } 
        />

        {/* Protected Routes - Student */}
        <Route 
          path="/student/dashboard" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/student/achievements" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AchievementsPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />

        {/* Protected Routes - Tutor */}
        <Route 
          path="/tutor/dashboard" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <TutorDashboard />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/courses" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <CoursesPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/my-courses" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <MyCoursesPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/courses/create" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <CourseCreatePage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/assignments" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentListPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />

        {/* Protected Routes - Admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/courses" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <CoursesAdminPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/assignments" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AssignmentsAdminPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/payments" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <PaymentsPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/feed-moderation" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <FeedModerationPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['admin', 'superadmin']}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />

        {/* Protected Routes - All Authenticated Users */}
        <Route 
          path="/community" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CommunityFeedPage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/chat/:roomId" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />

        {/* Assignment Routes - Students */}
        <Route 
          path="/assignments" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AssignmentListPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/courses/:courseId/assignments/:assignmentId" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AssignmentDetailPage />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/courses/:courseId/assignments/:assignmentId/submit" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AssignmentSubmitPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />

        {/* Assignment Routes - Tutors */}
        <Route 
          path="/tutor/assignments" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentListPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/assignments/create" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentCreatePage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/courses/:courseId/assignments/create" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentCreatePage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/assignments/:assignmentId/submissions" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentSubmissionsPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tutor/assignments/submissions/:submissionId/grade" 
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <AssignmentGradingPage />
                </DashboardLayout>
              </RoleRoute>
            </PrivateRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;