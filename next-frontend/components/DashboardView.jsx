'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { OPACModule } from '@/components/modules/OPACModule';
import { CataloguingModule } from '@/components/modules/CataloguingModule';
import { CirculationModule } from '@/components/modules/CirculationModule';
import { SerialModule } from '@/components/modules/SerialModule';
import { MISModule } from '@/components/modules/MISModule';
import { AdminModule } from '@/components/modules/AdminModule';
import { SuperAdminModule } from '@/components/modules/SuperAdminModule';
import { MyBooksModule } from '@/components/modules/MyBooksModule';
import { BTCardModal } from '@/components/BTCardModal';

export function DashboardView() {
  const { activeTab, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBtCardOpen, setIsBtCardOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'opac':
        return <OPACModule />;
      case 'mybooks':
        return <MyBooksModule onOpenBtCard={() => setIsBtCardOpen(true)} />;
      case 'cataloguing':
        return <CataloguingModule />;
      case 'circulation':
        return <CirculationModule />;
      case 'serials':
        return <SerialModule />;
      case 'mis':
        return <MISModule />;
      case 'collegeadmin':
        return <AdminModule />;
      case 'superadmin':
        return <SuperAdminModule />;
      default:
        return <OPACModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors">
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenBtCard={() => setIsBtCardOpen(true)}
      />
      <div className="flex-1 flex relative">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenBtCard={() => setIsBtCardOpen(true)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      <BTCardModal
        isOpen={isBtCardOpen}
        onClose={() => setIsBtCardOpen(false)}
      />
    </div>
  );
}
