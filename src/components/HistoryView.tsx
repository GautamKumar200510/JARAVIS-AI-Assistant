import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  Terminal, 
  Clock, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { soundFX } from '../services/sound';
import { CommandIntent, CommandLog } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

export const HistoryView: React.FC = () => {
  const { commandHistory, deleteCommand, clearCommandHistory, executeCommand, setActiveTab } = useJaravis();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const filterIntents: { id: string; label: string }[] = [
    { id: 'all', label: 'All Protocols' },
    { id: 'open_website', label: 'Web Directives' },
    { id: 'web_search', label: 'Web Searches' },
    { id: 'ai_chat', label: 'AI Intelligence' },
    { id: 'app_navigation', label: 'Navigation' },
    { id: 'weather', label: 'Weather Data' },
    { id: 'save_note', label: 'Vault Notes' },
    { id: 'system_status', label: 'System Diagnostics' }
  ];

  const filteredCommands = commandHistory.filter((cmd) => {
    const matchesIntent = selectedIntent === 'all' || cmd.intent === selectedIntent;
    const matchesSearch =
      cmd.rawInput.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.responseText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReRun = (rawInput: string) => {
    soundFX.playClick();
    executeCommand(rawInput);
    setActiveTab('command');
  };

  return (
    <section 
      id="jaravis-history-view"
      className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden p-6 md:p-8"
    >
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('command')}
            className="text-xs font-sans text-gray-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
          >
            <span>← Home</span>
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-sans">
              Search & Activity History
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              All previous queries, grounding results and command logs
            </p>
          </div>
        </div>

        {/* Action button to clear history */}
        {commandHistory.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center space-x-2 bg-[#1a1a1f] p-1.5 rounded-xl border border-red-500/30">
                <span className="text-xs text-red-400 px-2 font-mono">Confirm flush?</span>
                <button
                  onClick={() => {
                    clearCommandHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-[#16161a] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#2d2d35] hover:border-red-500/30 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flush Logs</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search command queries or intelligence output..."
            className="w-full h-11 bg-[#111114] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl pl-10 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-600 outline-none"
          />
        </div>

        {/* Intent filter pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {filterIntents.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedIntent(item.id);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedIntent === item.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1f1f23]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Logs List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {filteredCommands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-[#111114] border border-[#1f1f23] rounded-2xl">
            <Terminal className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-300">No command logs match your criteria</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Try adjusting your query or execute a command from the Command Hub.
            </p>
          </div>
        ) : (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.id}
              className="bg-[#111114] border border-[#1f1f23] hover:border-[#2d2d35] rounded-2xl p-5 transition-all shadow-lg space-y-3"
            >
              {/* Header: Intent, time, latency, actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                    {cmd.intent.replace('_', ' ')}
                  </span>
                  <span className="text-gray-600 font-mono text-[10px]">•</span>
                  <span className="text-[11px] font-mono text-gray-500">
                    {new Date(cmd.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-gray-500 px-2 py-0.5 rounded bg-[#16161a] border border-[#1f1f23]">
                    {cmd.executionTimeMs}ms
                  </span>

                  {/* Re-run button */}
                  <button
                    onClick={() => handleReRun(cmd.rawInput)}
                    className="p-1.5 text-gray-500 hover:text-cyan-400 rounded-lg hover:bg-[#16161a] transition-colors cursor-pointer"
                    title="Re-execute command"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(cmd.responseText, cmd.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-[#16161a] transition-colors cursor-pointer"
                    title="Copy response"
                  >
                    {copiedId === cmd.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Delete individual command */}
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      deleteCommand(cmd.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#16161a] transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* User Prompt */}
              <div className="bg-[#16161a] p-3.5 rounded-xl border border-[#1f1f23]">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1">
                  Query Prompt
                </span>
                <p className="text-xs md:text-sm font-medium text-white font-sans">
                  {cmd.rawInput}
                </p>
              </div>

              {/* Output Content */}
              <div className="bg-[#0d0d0f] p-4 rounded-xl border border-[#1f1f23] max-h-60 overflow-y-auto">
                <MarkdownRenderer content={cmd.responseText} />
              </div>

              {/* Action Payload Launch Link if present */}
              {cmd.actionPayload?.url && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                  <div className="flex items-center space-x-2 text-xs text-cyan-300 truncate">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span className="font-medium text-white">{cmd.actionPayload.targetName || 'Action Link'}:</span>
                    <span className="font-mono text-cyan-400/80 truncate text-[11px]">{cmd.actionPayload.url}</span>
                  </div>
                  <a
                    href={cmd.actionPayload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono font-medium shrink-0 transition-colors"
                  >
                    Open ↗
                  </a>
                </div>
              )}

              {/* Verified Sources if any */}
              {cmd.searchSources && cmd.searchSources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {cmd.searchSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline bg-[#16161a] px-2.5 py-1 rounded-md border border-[#1f1f23] flex items-center space-x-1"
                    >
                      <span className="truncate max-w-xs">{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 ml-1 text-gray-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
