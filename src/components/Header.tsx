import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { assistantState, isSpeaking, telemetry } = useJaravis();
  const { user } = useAuth();
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (assistantState) {
      case 'listening':
        return {
          text: 'LISTENING TRANSCEIVER ACTIVE',
          dotClass: 'bg-amber-400 animate-ping',
          textClass: 'text-amber-400'
        };
      case 'processing':
        return {
          text: 'COMPUTING INTEL STREAM',
          dotClass: 'bg-purple-400 animate-pulse',
          textClass: 'text-purple-400'
        };
      case 'speaking':
        return {
          text: 'SPEECH SYNTHESIS ACTIVE',
          dotClass: 'bg-cyan-400 animate-ping',
          textClass: 'text-cyan-400'
        };
      default:
        return {
          text: 'JARAVIS ACTIVE',
          dotClass: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
          textClass: 'text-cyan-400'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header
      id="jaravis-header"
      className="h-16 shrink-0 border-b border-[#1f1f23] flex items-center justify-between px-6 md:px-8 bg-[#0d0d0f] z-20"
    >
      {/* Left side: Version & Status */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest hidden sm:inline-block">
          Core.v4.8
        </span>
        <span className="w-1 h-1 bg-gray-700 rounded-full hidden sm:inline-block" />
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status.dotClass}`} />
          <span className={`text-xs md:text-sm font-medium font-mono uppercase tracking-wider ${status.textClass}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Right side: Security & Time Telemetry */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Gemini Engine badge */}
        <div 
          className="hidden md:flex items-center space-x-2 px-3 py-1 bg-[#16161a] border border-[#2d2d35] rounded-full text-xs text-gray-300 font-mono"
          title="Google Gemini AI Engine"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-400">Model:</span>
          <span className="text-cyan-400 font-semibold">Gemini 3.7</span>
        </div>

        {/* API Secure Badge */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="uppercase text-[11px] font-mono tracking-wider text-gray-400">
            API Secure
          </span>
        </div>

        {/* Real-time UTC clock */}
        <div className="text-xs text-gray-500 font-mono tracking-wider tabular-nums">
          {utcTime || '12:00:00 UTC'}
        </div>

        {/* User Callsign Indicator */}
        {user && (
          <div className="hidden lg:flex items-center text-xs text-gray-400 border-l border-[#1f1f23] pl-4">
            <span className="text-gray-500 font-mono mr-1">Operative:</span>
            <span className="text-gray-200 font-mono font-medium">{user.callsign}</span>
          </div>
        )}
      </div>
    </header>
  );
};
