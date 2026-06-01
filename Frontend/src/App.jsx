import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { Login, Register } from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassManagement from './pages/ClassManagement';
import QuizManagement from './pages/QuizManagement';
import ChatTutor from './pages/ChatTutor';
import QuizPage from './pages/QuizPage';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" />;
  
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'teacher' ? <Navigate to="/teacher" /> : <Navigate to="/student" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="bg-dark-950 min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/quiz/:id" element={
            <ProtectedRoute allowedRole="student">
              <QuizPage />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/teacher/classes" element={
            <ProtectedRoute allowedRole="teacher">
              <ClassManagement />
            </ProtectedRoute>
          } />

          <Route path="/teacher/quizzes" element={
            <ProtectedRoute allowedRole="teacher">
              <QuizManagement />
            </ProtectedRoute>
          } />

          <Route path="/tutor" element={
            <ProtectedRoute allowedRole="student">
              <ChatTutor />
            </ProtectedRoute>
          } />

          <Route path="*" element={<div className="h-screen flex items-center justify-center text-4xl font-bold">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
