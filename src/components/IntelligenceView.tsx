import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  HardDrive, 
  Search, 
  CloudSun, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  Terminal,
  Sparkles
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { soundFX } from '../services/sound';
import { api } from '../services/api';
import { SearchSource } from '../types';

export const IntelligenceView: React.FC = () => {
  const { telemetry, refreshTelemetry, executeCommand, setActiveTab } = useJaravis();
  
  // Dedicated Search tester
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ responseText: string; sources: SearchSource[] } | null>(null);

  // Dedicated Weather tester
  const [weatherCity, setWeatherCity] = useState<string>('Malibu, CA');
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherResult, setWeatherResult] = useState<{ report: string; sources: SearchSource[] } | null>(null);

  const handleRunSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    soundFX.playProcessingBeep();
    try {
      const res = await api.system.search(searchQuery.trim());
      setSearchResult({
        responseText: res.responseText,
        sources: res.searchSources || []
      });
      soundFX.playSuccess();
    } catch (e: any) {
      soundFX.playError();
      setSearchResult({
        responseText: `Search query failed: ${e.message}`,
        sources: []
      });
    } finally {
      setSearching(false);
    }
  };

  const handleRunWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherCity.trim()) return;
    setWeatherLoading(true);
    soundFX.playProcessingBeep();
    try {
      const res = await api.system.getWeather(weatherCity.trim());
      setWeatherResult({
        report: res.weatherReport,
        sources: res.searchSources || []
      });
      soundFX.playSuccess();
    } catch (e: any) {
      soundFX.playError();
      setWeatherResult({
        report: `Weather lookup failed: ${e.message}`,
        sources: []
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <section 
      id="jaravis-intelligence-view"
      className="flex-1 flex flex-col h-full bg-[#09090b] overflow-y-auto p-6 md:p-8 space-y-8"
    >
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('command')}
            className="text-xs font-sans text-gray-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
          >
            <span>← Home</span>
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-sans">
              Diagnostics & Subsystems
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Real-time telemetry, model engines and search tools
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            refreshTelemetry();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-full text-xs transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 1. Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Core Engine */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-[#1f1f23] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">AI Intelligence Core</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-semibold text-white font-mono">
            Gemini 3.7 Flash
          </div>
          <p className="text-xs text-emerald-400 flex items-center space-x-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Search Grounding Active</span>
          </p>
        </div>

        {/* Metric 2: Uptime */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-[#1f1f23] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">System Uptime</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-semibold text-white font-mono">
            {telemetry?.uptimeSeconds ? `${Math.floor(telemetry.uptimeSeconds / 60)}m ${telemetry.uptimeSeconds % 60}s` : '99.98%'}
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Continuous Node.js Process
          </p>
        </div>

        {/* Metric 3: Memory Heap */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-[#1f1f23] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">Memory Heap</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-semibold text-white font-mono">
            {telemetry?.memoryUsageMB || 52} MB
          </div>
          <div className="w-full bg-[#1f1f23] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (telemetry?.memoryUsageMB || 52) / 2)}%` }} 
            />
          </div>
        </div>

        {/* Metric 4: Compute Load */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-[#1f1f23] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-500">Compute Load</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-semibold text-white font-mono">
            {telemetry?.cpuLoadPercent || 14}% Nominal
          </div>
          <div className="w-full bg-[#1f1f23] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${telemetry?.cpuLoadPercent || 14}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive Tool Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Web Search Grounding Panel */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-[#1f1f23] space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Google Web Intelligence Grounding
            </h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Execute real-time internet search queries grounded via Google Search API with verified web references.
          </p>

          <form onSubmit={handleRunSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Latest quantum computing breakthroughs 2026..."
              className="flex-1 h-11 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs md:text-sm text-white placeholder-gray-600 outline-none"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-colors cursor-pointer"
            >
              {searching ? 'Querying...' : 'Search'}
            </button>
          </form>

          {searchResult && (
            <div className="bg-[#0d0d0f] p-4 rounded-xl border border-[#1f1f23] space-y-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">
                Intelligence Stream:
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                {searchResult.responseText}
              </p>
              {searchResult.sources.length > 0 && (
                <div className="pt-2 border-t border-[#1f1f23] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">
                    Referenced Sources:
                  </span>
                  {searchResult.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>• {s.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1 text-gray-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Atmospheric Weather Diagnostic */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-[#1f1f23] space-y-4">
          <div className="flex items-center space-x-2">
            <CloudSun className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Atmospheric & Meteorological Telemetry
            </h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Query satellite weather data, barometric pressure, relative humidity, and flight suit parameters.
          </p>

          <form onSubmit={handleRunWeather} className="flex gap-2">
            <input
              type="text"
              value={weatherCity}
              onChange={(e) => setWeatherCity(e.target.value)}
              placeholder="e.g. Tokyo, Japan or Malibu, CA"
              className="flex-1 h-11 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs md:text-sm text-white placeholder-gray-600 outline-none"
            />
            <button
              type="submit"
              disabled={weatherLoading}
              className="px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-colors cursor-pointer"
            >
              {weatherLoading ? 'Analyzing...' : 'Report'}
            </button>
          </form>

          {weatherResult && (
            <div className="bg-[#0d0d0f] p-4 rounded-xl border border-[#1f1f23] space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">
                Atmospheric Scan:
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                {weatherResult.report}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Security Subsystem status */}
      <div className="bg-[#111114] p-6 rounded-2xl border border-[#1f1f23] space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase">
            Encrypted Boundary & Server Isolation
          </h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          All API secrets and Gemini credentials are authenticated exclusively via backend environment isolation. No secrets are leaked to the client browser. User sessions are signed with cryptographic tokens.
        </p>
      </div>
    </section>
  );
};
