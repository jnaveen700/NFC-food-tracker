import React, { useState } from 'react';
import { MealType, User, EventDay } from './types';
import { TabType, MobileBottomNav } from './components/Layout/MobileBottomNav';
import { DesktopSidebar } from './components/Layout/DesktopSidebar';
import { TopHeader } from './components/Layout/TopHeader';

import { ScannerPage } from './pages/ScannerPage';
import { HistoryPage } from './pages/HistoryPage';
import { StudentsPage } from './pages/StudentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { DemoScannerSheet } from './components/Scanner/DemoScannerSheet';
import { api } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('nfc_mess_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  
  // Persistent NEXUS session state
  const [activeDay, setActiveDay] = useState<EventDay>('Day 1');
  const [activeSessionType, setActiveSessionType] = useState<'Snack' | 'Meal'>('Snack');

  const currentSession = `${activeDay} ${activeSessionType}`;

  const [initialCardForAdd, setInitialCardForAdd] = useState<string | undefined>(undefined);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem('nfc_mess_token', token);
    localStorage.setItem('nfc_mess_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('nfc_mess_token');
    localStorage.removeItem('nfc_mess_user');
    setUser(null);
  };

  const handleAddStudentWithCard = (cardId: string) => {
    setInitialCardForAdd(cardId);
    setActiveTab('students');
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row selection:bg-brand-500 selection:text-white">
      {/* Desktop Navigation Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <TopHeader
          activeMeal={currentSession}
          onOpenMealSelector={() => setActiveTab('scanner')}
          onOpenDemoScanner={() => setIsDemoSheetOpen(true)}
        />

        {/* Dynamic Page Component */}
        <main className="flex-1 bg-slate-50">
          {activeTab === 'scanner' && (
            <ScannerPage
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              activeSessionType={activeSessionType}
              setActiveSessionType={setActiveSessionType}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onAddStudentWithCard={handleAddStudentWithCard}
            />
          )}

          {activeTab === 'history' && <HistoryPage />}

          {activeTab === 'students' && (
            <StudentsPage
              initialCardIdForAdd={initialCardForAdd}
              onClearInitialCardId={() => setInitialCardForAdd(undefined)}
            />
          )}

          {activeTab === 'dashboard' && <DashboardPage />}

          {activeTab === 'settings' && (
            <SettingsPage user={user} onLogout={handleLogout} />
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Quick Access Demo Sheet Header Trigger */}
      <DemoScannerSheet
        isOpen={isDemoSheetOpen}
        onClose={() => setIsDemoSheetOpen(false)}
        onSimulateScan={async (cardId) => {
          setIsDemoSheetOpen(false);
          setActiveTab('scanner');
          try {
            await api.scanCard(cardId, currentSession);
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
};

export default App;
