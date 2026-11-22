import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Inventory } from './pages/Inventory';
import { Requests } from './pages/Requests';
import { NationalLiveNetwork } from './pages/NationalLiveNetwork';
import { DataIntegrations } from './pages/DataIntegrations';
import { LiveNetwork } from './pages/LiveNetwork';
import { DeliveryTracking } from './pages/DeliveryTracking';
import { CoordinationDashboard } from './pages/CoordinationDashboard';
import { Chat } from './pages/Chat';
import { Alerts } from './pages/Alerts';
import { Profile } from './pages/Profile';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected App Routes wrapped in AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/national-network" element={<NationalLiveNetwork />} />
            <Route path="/data-integrations" element={<DataIntegrations />} />
            <Route path="/live-network" element={<LiveNetwork />} />
            <Route path="/delivery-tracking" element={<DeliveryTracking />} />
            <Route path="/coordination" element={<CoordinationDashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
