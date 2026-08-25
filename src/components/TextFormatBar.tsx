import React from 'react';
import { Type, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { FontFamilyChoice, FontSizeChoice, RenderModeChoice, LineSpacingChoice } from '../types';

interface TextFormatBarProps {
  compact?: boolean;
}

export const TextFormatBar: React.FC<TextFormatBarProps> = ({ compact = false }) => {
  const { textFormatSettings, updateTextFormatSettings } = useJaravis();

  const fontOptions: { id: FontFamilyChoice; label: string; preview: string }[] = [
    { id: 'space-grotesk', label: 'Space Grotesk', preview: 'Futuristic Sans' },
    { id: 'rajdhani', label: 'Rajdhani', preview: 'Tactical HUD' },
    { id: 'jetbrains-mono', label: 'JetBrains Mono', preview: 'Terminal Code' },
    { id: 'jakarta', label: 'Jakarta', preview: 'Modern UI' },
    { id: 'system', label: 'System Default', preview: 'Clean OS' }
  ];

  const sizeOptions: { id: FontSizeChoice; label: string }[] = [
    { id: 'compact', label: 'Small' },
    { id: 'standard', label: 'Default' },
    { id: 'comfortable', label: 'Medium' },
    { id: 'expansive', label: 'Large' }
  ];

  const renderModeOptions: { id: RenderModeChoice; label: string; icon: string }[] = [
    { id: 'rich_markdown', label: 'Rich Markdown', icon: '📝' },
    { id: 'cyber_tactical', label: 'Tactical HUD', icon: '⚡' },
    { id: 'raw_terminal', label: 'Terminal Stream', icon: '📟' }
  ];

  const spacingOptions: { id: LineSpacingChoice; label: string }[] = [
    { id: 'tight', label: 'Tight' },
    { id: 'normal', label: 'Normal' },
    { id: 'relaxed', label: 'Relaxed' }
  ];

  if (compact) {
    return (
      <div id="quick-text-format-bar" className="flex items-center space-x-1.5 bg-[#121216] p-1 rounded-lg border border-[#22222a] text-xs">
        <div className="flex items-center px-1.5 py-0.5 text-gray-500 font-mono text-[10px] uppercase">
          <Type className="w-3 h-3 text-cyan-400 mr-1" />
          <span className="hidden sm:inline">Format:</span>
        </div>

        {/* Font Quick Switcher */}
        <select
          id="quick-font-select"
          value={textFormatSettings.fontFamily}
          onChange={(e) => updateTextFormatSettings({ fontFamily: e.target.value as FontFamilyChoice })}
          className="bg-[#1a1a22] text-cyan-300 font-mono text-[11px] px-2 py-1 rounded border border-[#2d2d38] focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {fontOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Render Mode Switcher */}
        <select
          id="quick-mode-select"
          value={textFormatSettings.renderMode}
          onChange={(e) => updateTextFormatSettings({ renderMode: e.target.value as RenderModeChoice })}
          className="bg-[#1a1a22] text-gray-200 font-mono text-[11px] px-2 py-1 rounded border border-[#2d2d38] focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {renderModeOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.icon} {m.label}
            </option>
          ))}
        </select>

        {/* Size Switcher */}
        <div className="hidden md:flex items-center space-x-0.5 border-l border-[#22222a] pl-1.5">
          {sizeOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              id={`quick-size-btn-${s.id}`}
              onClick={() => updateTextFormatSettings({ fontSize: s.id })}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                textFormatSettings.fontSize === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a22]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="full-text-format-panel" className="bg-[#121216] p-4 rounded-xl border border-[#1f1f26] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1f1f26] pb-2.5">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            Text & Typography Formatting
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
          Live Formatting Engine
        </span>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide flex items-center justify-between">
          <span>Primary Typeface / Font Family</span>
          <span className="text-cyan-400">{textFormatSettings.fontFamily}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fontOptions.map((f) => (
            <button
              key={f.id}
              type="button"
              id={`select-font-${f.id}`}
              onClick={() => updateTextFormatSettings({ fontFamily: f.id })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                textFormatSettings.fontFamily === f.id
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-[#181820] border-[#252530] text-gray-300 hover:border-gray-600 hover:bg-[#1f1f2a]'
              }`}
            >
              <div className="text-xs font-semibold">{f.label}</div>
              <div className="text-[10px] text-gray-400 truncate mt-0.5">{f.preview}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Render Formatting Mode */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide flex items-center justify-between">
          <span>Display Mode & Layout</span>
          <span className="text-cyan-400">{textFormatSettings.renderMode.replace('_', ' ')}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {renderModeOptions.map((m) => (
            <button
              key={m.id}
              type="button"
              id={`select-mode-${m.id}`}
              onClick={() => updateTextFormatSettings({ renderMode: m.id })}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                textFormatSettings.renderMode === m.id
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                  : 'bg-[#181820] border-[#252530] text-gray-300 hover:border-gray-600 hover:bg-[#1f1f2a]'
              }`}
            >
              <div className="text-sm mb-1">{m.icon}</div>
              <div className="text-[11px]">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size & Spacing Sliders/Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Size */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">
            Text Scale Size
          </label>
          <div className="grid grid-cols-4 gap-1 bg-[#181820] p-1 rounded-lg border border-[#252530]">
            {sizeOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                id={`font-size-${s.id}`}
                onClick={() => updateTextFormatSettings({ fontSize: s.id })}
                className={`py-1 rounded text-[11px] font-mono transition-all text-center ${
                  textFormatSettings.fontSize === s.id
                    ? 'bg-cyan-500 text-black font-bold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">
            Line Spacing / Height
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#181820] p-1 rounded-lg border border-[#252530]">
            {spacingOptions.map((sp) => (
              <button
                key={sp.id}
                type="button"
                id={`line-spacing-${sp.id}`}
                onClick={() => updateTextFormatSettings({ lineSpacing: sp.id })}
                className={`py-1 rounded text-[11px] font-mono transition-all text-center ${
                  textFormatSettings.lineSpacing === sp.id
                    ? 'bg-cyan-500 text-black font-bold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
