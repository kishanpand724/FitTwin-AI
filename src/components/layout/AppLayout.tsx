import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Toast } from '../common/Toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Route where we show the dedicated app sidebar
  const isAppSection = [
    '/dashboard',
    '/digital-twin',
    '/stylist',
    '/discover',
    '/saved',
    '/settings',
  ].includes(location.pathname);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#20211F]">
      <Navbar />

      <div className="flex-1 flex w-full">
        {isAppSection && <Sidebar />}

        <main className={`flex-1 w-full ${isAppSection ? 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
          {children}
        </main>
      </div>

      <Toast />
      <Footer />
    </div>
  );
};
