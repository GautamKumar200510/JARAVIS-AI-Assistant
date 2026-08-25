import React from 'react';
import { Globe, FileUp, BookmarkPlus, Sparkles, CloudSun, Terminal } from 'lucide-react';
import { soundFX } from '../services/sound';

interface PromptPlusMenuProps {
  onSelectAction: (action: string, promptText?: string) => void;
  onClose: () => void;
}

export const PromptPlusMenu: React.FC<PromptPlusMenuProps> = ({
  onSelectAction,
  onClose
}) => {
  const actions = [
    {
      id: 'web_search',
      label: 'Google Web Search',
      description: 'Fetch real-time live web intelligence',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      prompt: 'Search Google for '
    },
    {
      id: 'weather',
      label: 'Live Atmospheric Telemetry',
      description: 'Check real-time weather & conditions',
      icon: <CloudSun className="w-4 h-4 text-amber-400" />,
      prompt: 'What is the weather today?'
    },
    {
      id: 'quick_note',
      label: 'Save Note to Vault',
      description: 'Capture notes and tactical intelligence',
      icon: <BookmarkPlus className="w-4 h-4 text-emerald-400" />,
      prompt: 'Save this as a note: '
    },
    {
      id: 'diagnostics',
      label: 'System Diagnostics',
      description: 'Run CPU, memory & node telemetry check',
      icon: <Terminal className="w-4 h-4 text-purple-400" />,
      prompt: 'Run full system diagnostics'
    }
  ];

  return (
    <div 
      id="gemini-plus-menu"
      className="absolute bottom-full left-0 mb-3 w-72 bg-[#1e1f20] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
    >
      <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-300">Quick Capabilities</span>
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      </div>

      <div className="space-y-1">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              soundFX.playClick();
              onSelectAction(act.id, act.prompt);
              onClose();
            }}
            className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 group-hover:border-white/20 transition-colors">
              {act.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {act.label}
              </div>
              <p className="text-[11px] text-gray-400 truncate">
                {act.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
