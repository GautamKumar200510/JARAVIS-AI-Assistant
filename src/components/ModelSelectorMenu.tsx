import React from 'react';
import { Check, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { soundFX } from '../services/sound';

interface ModelSelectorMenuProps {
  selectedModel: 'flash' | 'pro' | 'thinking';
  onSelectModel: (model: 'flash' | 'pro' | 'thinking') => void;
  onClose: () => void;
}

export const ModelSelectorMenu: React.FC<ModelSelectorMenuProps> = ({
  selectedModel,
  onSelectModel,
  onClose
}) => {
  const models: {
    id: 'flash' | 'pro' | 'thinking';
    name: string;
    description: string;
    badge: string;
    dotColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'flash',
      name: 'Gemini 2.5 Flash',
      description: 'Fastest response time & multi-modal command execution',
      badge: 'Default',
      dotColor: 'bg-[#4285F4]',
      icon: <Zap className="w-4 h-4 text-[#4285F4]" />
    },
    {
      id: 'pro',
      name: 'Gemini 3.7 Pro',
      description: 'Advanced reasoning, deep synthesis & complex code intelligence',
      badge: 'Reasoning',
      dotColor: 'bg-[#9B72CB]',
      icon: <Sparkles className="w-4 h-4 text-[#9B72CB]" />
    },
    {
      id: 'thinking',
      name: 'Deep Thinking Mode',
      description: 'Extended step-by-step cognitive analysis & structured breakdown',
      badge: 'Ultra',
      dotColor: 'bg-[#ff8bcb]',
      icon: <BrainCircuit className="w-4 h-4 text-[#ff8bcb]" />
    }
  ];

  return (
    <div 
      id="gemini-model-selector-menu"
      className="absolute bottom-full right-0 mb-3 w-80 bg-[#1e1f20] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
    >
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-300">Choose Model</span>
        <span className="text-[10px] text-gray-500 font-mono">Google GenAI 2026</span>
      </div>

      <div className="space-y-1">
        {models.map((m) => {
          const isSelected = selectedModel === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                soundFX.playClick();
                onSelectModel(m.id);
                onClose();
              }}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${
                isSelected 
                  ? 'bg-white/10 border border-white/10' 
                  : 'hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white truncate">{m.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                    {m.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  {m.description}
                </p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
