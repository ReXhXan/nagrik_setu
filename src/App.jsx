import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MapHome } from './pages/MapHome';
import { Feed } from './pages/Feed';
import { ReportDetail } from './pages/ReportDetail';
import { MyReports } from './pages/MyReports';
import { Admin } from './pages/Admin';

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<MapHome />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/report/:id" element={<ReportDetail />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
