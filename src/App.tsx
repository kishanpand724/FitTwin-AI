import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { StylistPage } from './pages/StylistPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { SavedLooksPage } from './pages/SavedLooksPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-profile" element={<CreateProfilePage />} />
            <Route path="/digital-twin" element={<DigitalTwinPage />} />
            <Route path="/stylist" element={<StylistPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/saved" element={<SavedLooksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ProfileProvider>
  );
}
