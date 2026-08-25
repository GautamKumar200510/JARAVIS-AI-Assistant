import React, { useState, useEffect } from 'react';
import { CloudSun, ArrowRight, BookOpen, Clock, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../services/sound';
import { api } from '../services/api';

export const TacticalSidebar: React.FC = () => {
  const { commandHistory, notes, executeCommand, setActiveTab, telemetry, refreshTelemetry } = useJaravis();
  const { user } = useAuth();

  const [weatherCity, setWeatherCity] = useState<string>('Palo Alto, CA');
  const [weatherTemp, setWeatherTemp] = useState<string>('72°F');
  const [weatherDesc, setWeatherDesc] = useState<string>('Optimal visibility & clear atmospheric index.');
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  const fetchQuickWeather = async (city: string) => {
    setLoadingWeather(true);
    try {
      const res = await api.system.getWeather(city);
      setWeatherCity(city);
      // Extract temperature or short description if available
      const tempMatch = res.weatherReport.match(/(\d+°[FC])/i);
      if (tempMatch) {
        setWeatherTemp(tempMatch[1]);
      }
      setWeatherDesc(res.speakableText.slice(0, 80) + '...');
    } catch {
      // Keep defaults
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleCommandClick = (cmdText: string) => {
    soundFX.playClick();
    executeCommand(cmdText);
  };

  const recentNotes = notes.slice(0, 2);
  const recentCommands = commandHistory.slice(0, 4);

  return (
    <aside
      id="jaravis-tactical-sidebar"
      className="hidden xl:flex w-80 shrink-0 border-l border-[#1f1f23] p-6 flex-col space-y-6 bg-[#0a0a0c] overflow-y-auto z-10"
    >
      {/* 1. Command History Stream */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">
            Command History
          </h3>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('history');
            }}
            className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentCommands.length === 0 ? (
            <div className="text-xs text-gray-600 italic py-2">
              No recent commands recorded.
            </div>
          ) : (
            recentCommands.map((cmd, i) => {
              const isFirst = i === 0;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleCommandClick(cmd.rawInput)}
                  className="group cursor-pointer transition-all"
                  title="Click to re-run command"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-1 h-8 rounded-full transition-colors shrink-0 ${
                        isFirst
                          ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : 'bg-gray-800 group-hover:bg-cyan-500'
                      }`}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`text-xs font-medium truncate transition-colors ${
                          isFirst ? 'text-cyan-400 font-semibold' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {cmd.rawInput}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono">
                        {isFirst ? 'Just now' : new Date(cmd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {cmd.intent.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Recent Notes Vault Snapshot */}
      <div className="pt-4 border-t border-[#1f1f23]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">
            Recent Notes
          </h3>
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('notes');
            }}
            className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>VAULT</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="bg-[#111114] p-4 rounded-xl border border-[#1f1f23] text-xs text-gray-500 text-center">
            Vault is empty. Instruct JARAVIS to "Save note: ..."
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('notes');
                }}
                className="bg-[#111114] hover:bg-[#16161a] p-4 rounded-xl border border-[#1f1f23] hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <h4 className="text-xs font-semibold text-gray-200 mb-1 truncate group-hover:text-cyan-400">
                  {note.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-2 font-sans line-clamp-2">
                  {note.content.replace(/[#*`]/g, '')}
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-[#1f1f23]/60">
                  <span className="text-[10px] text-cyan-500 font-mono">
                    #{note.tags[0] || 'Note'}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Environmental Atmospheric Data */}
      <div 
        id="environmental-weather-widget"
        className="mt-auto p-4 bg-[#111114]/80 border border-[#1f1f23] rounded-xl space-y-2 relative group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] text-gray-300 uppercase tracking-wider font-mono">
              Atmospheric Index
            </span>
          </div>
          <button
            onClick={() => fetchQuickWeather(weatherCity)}
            className="text-gray-500 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-white">{weatherCity}</span>
          <span className="text-sm font-mono text-cyan-400 font-bold">{weatherTemp}</span>
        </div>

        <p className="text-[10px] text-gray-400 leading-relaxed font-sans line-clamp-2">
          {weatherDesc}
        </p>
      </div>

      {/* 4. Telemetry Miniature Ribbon */}
      <div className="p-3 bg-[#0d0d0f] border border-[#1f1f23] rounded-lg flex items-center justify-between text-[11px] font-mono text-gray-500">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>RAM: {telemetry?.memoryUsageMB || 48}MB</span>
        </div>
        <span className="text-gray-600">|</span>
        <div className="text-emerald-400">
          Uptime: {telemetry?.uptimeSeconds ? `${Math.floor(telemetry.uptimeSeconds / 60)}m` : 'Online'}
        </div>
      </div>
    </aside>
  );
};
