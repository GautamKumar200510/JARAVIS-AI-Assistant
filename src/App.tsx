import React from 'react';
import { JaravisProvider, useJaravis } from './context/JaravisContext';
import { AuthProvider } from './context/AuthContext';
import { SidebarNav } from './components/SidebarNav';
import { AssistantTerminal } from './components/AssistantTerminal';
import { HistoryView } from './components/HistoryView';
import { NotesView } from './components/NotesView';
import { IntelligenceView } from './components/IntelligenceView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab } = useJaravis();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryView />;
      case 'notes':
        return <NotesView />;
      case 'intelligence':
        return <IntelligenceView />;
      case 'command':
      default:
        return <AssistantTerminal />;
    }
  };

  return (
    <div 
      id="gemini-root-container"
      className="flex h-screen w-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden select-none"
    >
      {/* 1. Left Vertical Icon Navigation (Gemini Star, Nav Icons, Settings + Blue Dot, Gautam Avatar) */}
      <SidebarNav />

      {/* 2. Central Deck */}
      <main 
        id="gemini-center-deck"
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
      >
        {renderActiveView()}
      </main>

      {/* 3. Global Preference & Authentication Modals */}
      <SettingsModal />
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <JaravisProvider>
        <AppContent />
      </JaravisProvider>
    </AuthProvider>
  );
}

export default App;
