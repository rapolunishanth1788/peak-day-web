/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SectionId } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { AcademicProvider } from './contexts/AcademicContext';
import { FitnessProvider } from './contexts/FitnessContext';
import { AppShell } from './components/layout/AppShell';
import { DesignSystemShowcase } from './components/foundation/DesignSystemShowcase';
import { SectionPreview } from './components/foundation/SectionPreview';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage, AuthViewMode } from './components/auth/AuthPage';
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen';
import { ModeSwitcher } from './components/layout/ModeSwitcher';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState<SectionId>('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'design_system' | 'os_preview' | 'auth_page'>('landing');
  const [authPageInitialMode, setAuthPageInitialMode] = useState<AuthViewMode>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  // After authentication, users automatically enter the main Peak Day application
  useEffect(() => {
    if (user && viewMode === 'landing') {
      setViewMode('os_preview');
    }
  }, [user, viewMode]);

  // Handle opening popup auth modal or dedicated full auth page
  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // When authentication succeeds, transition right into the main Peak Day application!
    setIsAuthModalOpen(false);
    setViewMode('os_preview');
  };

  const handleLogoutSuccess = () => {
    setViewMode('landing');
  };

  // Show ambient loading screen while restoring persistent Firebase Auth session
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // If user navigated to dedicated Auth Page
  if (viewMode === 'auth_page') {
    return (
      <AuthPage
        initialMode={authPageInitialMode}
        onSuccess={handleAuthSuccess}
        onBackToLanding={() => setViewMode('landing')}
      />
    );
  }

  return (
    <>
      {/* Interactive Auth Modal for Login, Signup & Reset */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Main View Router */}
      {viewMode === 'landing' ? (
        <LandingPage
          onLoginClick={handleOpenLogin}
          onGetStartedClick={handleOpenSignUp}
          onLaunchOS={() => setViewMode('os_preview')}
        />
      ) : (
        <AppShell
          currentSection={currentSection}
          onSelectSection={(section) => {
            setCurrentSection(section);
            setViewMode('os_preview');
          }}
          onLogoutSuccess={handleLogoutSuccess}
        >
          {/* Top navigation pill to switch between Landing, Workspace & Design Tokens */}
          <ModeSwitcher
            viewMode={viewMode}
            onChangeViewMode={(mode) => {
              if (mode === 'landing') {
                setViewMode('landing');
              } else {
                setViewMode(mode);
              }
            }}
            currentSection={currentSection}
          />

          {/* Primary OS View Content with smooth page transition */}
          {viewMode === 'design_system' ? (
            <DesignSystemShowcase />
          ) : (
            <SectionPreview
              sectionId={currentSection}
              onNavigateToDesignSystem={() => setViewMode('design_system')}
              onNavigateSection={(sec) => setCurrentSection(sec)}
            />
          )}
        </AppShell>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <ScheduleProvider>
          <AcademicProvider>
            <FitnessProvider>
              <MainApp />
            </FitnessProvider>
          </AcademicProvider>
        </ScheduleProvider>
      </TaskProvider>
    </AuthProvider>
  );
}
