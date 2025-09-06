import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AgentLaunch } from './components/AgentLaunch';
import { BountyMarketplace } from './components/BountyMarketplace';
import { CreditManager } from './components/CreditManager';
import { UserProvider } from './contexts/UserContext';

type View = 'dashboard' | 'launch' | 'marketplace' | 'credits';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'launch':
        return <AgentLaunch onBack={() => setCurrentView('dashboard')} />;
      case 'marketplace':
        return <BountyMarketplace onBack={() => setCurrentView('dashboard')} />;
      case 'credits':
        return <CreditManager onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen gradient-bg text-white">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {renderView()}
        </main>
      </div>
    </UserProvider>
  );
}

export default App;