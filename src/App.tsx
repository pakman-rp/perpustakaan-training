import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/auth/Login';
import Layout from './components/common/Layout';
import AdminDashboard from './components/admin/AdminDashboard';
import BookManagement from './components/admin/BookManagement';
import MemberManagement from './components/admin/MemberManagement';
import BorrowHistory from './components/admin/BorrowHistory';
import UserDashboard from './components/user/UserDashboard';
import BorrowBooks from './components/user/BorrowBooks';
import UserBorrowHistory from './components/user/UserBorrowHistory';
import UserFines from './components/user/UserFines';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/books" element={
          <ProtectedRoute adminOnly>
            <BookManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/members" element={
          <ProtectedRoute adminOnly>
            <MemberManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/history" element={
          <ProtectedRoute adminOnly>
            <BorrowHistory />
          </ProtectedRoute>
        } />
        <Route path="/borrow" element={
          <ProtectedRoute>
            <BorrowBooks />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <UserBorrowHistory />
          </ProtectedRoute>
        } />
        <Route path="/fines" element={
          <ProtectedRoute>
            <UserFines />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;