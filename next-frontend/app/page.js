'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { LoginPage } from '@/components/LoginPage';
import { DashboardView } from '@/components/DashboardView';

export default function Home() {
  const { viewState } = useAuth();

  if (viewState === 'landing') {
    return <LandingPage />;
  }

  if (viewState === 'login') {
    return <LoginPage />;
  }

  return <DashboardView />;
}
