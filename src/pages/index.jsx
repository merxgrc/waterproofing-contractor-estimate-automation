import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Estimates from './Estimates';
import NewEstimate from './NewEstimate';
import EstimateDetail from './EstimateDetail';
import WaterproofingExpert from './WaterproofingExpert';
import Layout from './Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to AquaEstimate</h1>
        <p className="text-lg text-slate-600 mb-8">Professional Commercial Waterproofing Estimates, powered by Supabase.</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded shadow"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default function Pages() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="new" element={<NewEstimate />} />
            <Route path="estimate/:id" element={<EstimateDetail />} />
            <Route path="expert" element={<WaterproofingExpert />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}