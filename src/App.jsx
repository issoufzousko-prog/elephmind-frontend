import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Solutions from './pages/Solutions';

// App Layout & Pages (Authenticated)
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F0F2F5] via-[#E6E9EF] to-[#D8DEE9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans text-brand-dark dark:text-gray-100 relative selection:bg-brand-primary/30">
    <div className="bg-noise fixed inset-0 z-0"></div>
    <Navbar />
    <main className="flex-grow pt-20 relative z-10">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
        <Route path="/solutions" element={<PublicLayout><Solutions /></PublicLayout>} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<Patients />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
