import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { CollegeAdminPage } from './pages/CollegeAdminPage';
import { OPACPage } from './pages/OPACPage';
import { CataloguingPage } from './pages/CataloguingPage';
import { CirculationPage } from './pages/CirculationPage';
import { SerialControlPage } from './pages/SerialControlPage';
import { MISReportsPage } from './pages/MISReportsPage';

export function MainRouter() {
  const { viewState, user, restoreSession } = useAuth();
  const [activeTab, setActiveTab] = useState('opac');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'Super Admin') setActiveTab('superadmin');
      else if (user.role === 'Admin') setActiveTab('collegeadmin');
      else setActiveTab('opac');
    }
  }, [user]);

  if (viewState === 'landing') {
    return <LandingPage />;
  }

  if (viewState === 'login' || !user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'superadmin':
        return <SuperAdminPage />;
      case 'collegeadmin':
        return <CollegeAdminPage />;
      case 'opac':
        return <OPACPage />;
      case 'cataloguing':
        return <CataloguingPage />;
      case 'circulation':
        return <CirculationPage />;
      case 'serials':
        return <SerialControlPage />;
      case 'mis':
        return <MISReportsPage />;
      default:
        return <OPACPage />;
    }
  };

  return (
    <div className="min-h-screen yono-gradient-bg text-slate-900 flex flex-col font-sans selection:bg-[#a10053] selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
