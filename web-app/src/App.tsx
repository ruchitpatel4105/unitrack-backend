import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveFleetMapPage } from './pages/LiveFleetMapPage';
import { BusManagementPage } from './pages/BusManagementPage';
import { RouteManagementPage } from './pages/RouteManagementPage';
import { DriverTripsPage } from './pages/DriverTripsPage';
import { LostFoundAdminPage } from './pages/LostFoundAdminPage';
import { EmergencyAlertsPage } from './pages/EmergencyAlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { StudentRosterPage } from './pages/StudentRosterPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white text-xs font-semibold">
        Initializing Security Environment...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <EmergencyBanner />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/live-map" element={<LiveFleetMapPage />} />
            <Route path="/buses" element={<BusManagementPage />} />
            <Route path="/routes" element={<RouteManagementPage />} />
            <Route path="/students" element={<StudentRosterPage />} />
            <Route path="/driver-trips" element={<DriverTripsPage />} />
            <Route path="/lost-found" element={<LostFoundAdminPage />} />
            <Route path="/emergencies" element={<EmergencyAlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
