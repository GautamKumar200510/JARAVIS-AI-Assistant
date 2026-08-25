import React from 'react';
import { 
  SquarePen, 
  Search, 
  Bookmark, 
  Folder, 
  LayoutGrid, 
  Settings, 
  Radio, 
  SlidersHorizontal,
  Volume2,
  VolumeX,
  History,
  MessageSquarePlus,
  Compass
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../services/sound';
import { TabType } from '../types';
import { JarvisLogo } from './JarvisLogo';

export const SidebarNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    assistantState, 
    setSettingsOpen,
    soundEffectsEnabled,
    setSoundEffectsEnabled,
    clearActiveConversation
  } = useJaravis();
  
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const handleTabChange = (tab: TabType) => {
    soundFX.playClick();
    setActiveTab(tab);
  };

  const handleNewChat = () => {
    soundFX.playClick();
    if (clearActiveConversation) {
      clearActiveConversation();
    }
    setActiveTab('command');
  };

  const navItems = [
    {
      id: 'new_chat',
      label: 'New Directive',
      icon: <SquarePen className="w-4 h-4" />,
      onClick: handleNewChat
    },
    {
      id: 'history',
      label: 'Search & History',
      icon: <Search className="w-4 h-4" />,
      onClick: () => handleTabChange('history')
    },
    {
      id: 'notes',
      label: 'Saved & Notes',
      icon: <Bookmark className="w-4 h-4" />,
      onClick: () => handleTabChange('notes')
    },
    {
      id: 'intelligence',
      label: 'Workspace & Diagnostics',
      icon: <Folder className="w-4 h-4" />,
      onClick: () => handleTabChange('intelligence')
    },
    {
      id: 'apps',
      label: 'Integrations & Tools',
      icon: <LayoutGrid className="w-4 h-4" />,
      onClick: () => handleTabChange('intelligence')
    }
  ];

  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G';

  return (
    <aside
      id="gemini-sidebar-nav"
      className="w-14 sm:w-16 shrink-0 flex flex-col items-center py-4 bg-[#09090b] select-none z-30 justify-between h-full border-r border-white/[0.04]"
    >
      {/* Top Section: JARVIS Arc Reactor Logo + Nav Icons */}
      <div className="flex flex-col items-center space-y-5 w-full">
        {/* JARVIS Arc Reactor SVG Button */}
        <button 
          id="gemini-spark-logo-btn"
          onClick={handleNewChat}
          className="relative group p-2 hover:opacity-95 transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
          title="JARVIS Core"
        >
          <JarvisLogo size={28} className="transition-all duration-500 group-hover:rotate-90 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          <span className="absolute left-14 top-2 hidden group-hover:block bg-[#1e1f20] border border-cyan-500/20 text-cyan-300 text-xs font-sans px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap z-50">
            JARVIS
          </span>
        </button>

        {/* Vertical Icon Buttons */}
        <nav id="gemini-vertical-nav" className="flex flex-col space-y-2.5 items-center w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full px-2">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={item.onClick}
                  className={`p-2.5 rounded-full transition-colors duration-150 cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.07]'
                  }`}
                  aria-label={item.label}
                >
                  {item.icon}
                </button>

                {/* Tooltip */}
                <span className="absolute left-14 hidden group-hover:block bg-[#1e1f20] border border-white/10 text-white text-xs font-sans px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap z-50">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings with Blue Dot & User Avatar */}
      <div id="gemini-sidebar-bottom" className="flex flex-col items-center space-y-3.5 pb-2">
        {/* Sound toggle */}
        <div className="relative group">
          <button
            id="sidebar-sound-btn"
            onClick={() => {
              soundFX.playClick();
              setSoundEffectsEnabled(!soundEffectsEnabled);
            }}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
            title={soundEffectsEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEffectsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Settings button with Blue Notification Dot */}
        <div className="relative group">
          <button
            id="gemini-settings-btn"
            onClick={() => {
              soundFX.playClick();
              setSettingsOpen(true);
            }}
            className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/[0.07] rounded-full transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            {/* Small blue dot in upper right corner as seen in image */}
            <span 
              id="settings-blue-dot"
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4285F4] shadow-[0_0_6px_rgba(66,133,244,0.8)] ring-1 ring-[#09090b]" 
            />
          </button>
          <span className="absolute left-14 hidden group-hover:block bg-[#1e1f20] border border-white/10 text-white text-xs font-sans px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap z-50">
            Settings
          </span>
        </div>

        {/* Gautam's Avatar "G" in warm brown circle */}
        <div className="relative group">
          <button
            id="gautam-avatar-btn"
            onClick={() => {
              soundFX.playClick();
              if (isAuthenticated) {
                setSettingsOpen(true);
              } else {
                openAuthModal('login');
              }
            }}
            className="w-8 h-8 rounded-full bg-[#6b4c3b] hover:opacity-90 flex items-center justify-center text-white text-xs font-sans font-medium transition-transform active:scale-95 cursor-pointer shadow-md"
            title={user ? `${user.displayName} (${user.email})` : 'Gautam'}
          >
            {userInitial}
          </button>
          <span className="absolute left-14 bottom-1 hidden group-hover:block bg-[#1e1f20] border border-white/10 text-white text-xs font-sans px-2.5 py-1.5 rounded-md shadow-2xl whitespace-nowrap z-50">
            <span className="font-semibold text-white">{user?.displayName || 'Gautam'}</span>
            <span className="block text-[10px] text-gray-400">{user?.email || 'gautamkr.71019@gmail.com'}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
