import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  ArrowUp, 
  ChevronDown, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookmarkPlus, 
  RotateCcw,
  ExternalLink,
  SlidersHorizontal,
  Bot,
  User as UserIcon,
  Search,
  Globe,
  Radio,
  FileText,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Zap,
  Terminal,
  Compass
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../services/sound';
import { CommandLog } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ModelSelectorMenu } from './ModelSelectorMenu';
import { PromptPlusMenu } from './PromptPlusMenu';
import { TextFormatBar } from './TextFormatBar';
import { JarvisLogo } from './JarvisLogo';

export const AssistantTerminal: React.FC = () => {
  const { 
    assistantState, 
    activeCommand, 
    commandHistory, 
    currentTranscript, 
    executeCommand, 
    startVoiceListening, 
    stopVoiceListening, 
    speakText, 
    stopSpeech, 
    isSpeaking,
    createNote,
    selectedModel,
    setSelectedModel,
    isHomeView,
    setIsHomeView,
    clearActiveConversation,
    isClearingChat,
    chatNotice,
    clearChatMessages,
    setSettingsOpen
  } = useJaravis();

  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>('');
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [showPlusMenu, setShowPlusMenu] = useState<boolean>(false);
  const [showFormatBar, setShowFormatBar] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when in active conversation
  useEffect(() => {
    if (!isHomeView) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commandHistory, currentTranscript, assistantState, isHomeView, pendingQuery]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputText.trim();
    if (!cmd) return;
    setInputText('');
    setPendingQuery(cmd);
    setShowModelMenu(false);
    setShowPlusMenu(false);
    try {
      await executeCommand(cmd);
    } finally {
      setPendingQuery(null);
    }
  };

  const getLoadingMessage = (query: string | null) => {
    if (!query) return 'Thinking...';
    const lower = query.toLowerCase();
    
    if (lower.startsWith('open youtube') || lower.includes('youtube')) {
      return 'Opening YouTube...';
    }
    if (lower.startsWith('open whatsapp') || lower.includes('whatsapp')) {
      return 'Opening WhatsApp Web...';
    }
    if (lower.startsWith('open google maps') || lower.startsWith('open maps') || lower.includes('maps')) {
      return 'Opening Google Maps...';
    }
    if (lower.startsWith('open google drive') || lower.startsWith('open drive') || lower.includes('drive')) {
      return 'Opening Google Drive...';
    }
    if (lower.startsWith('open google calendar') || lower.startsWith('open calendar') || lower.includes('calendar')) {
      return 'Opening Google Calendar...';
    }
    if (lower.startsWith('open github') || lower.includes('github')) {
      return 'Opening GitHub...';
    }
    if (lower.startsWith('open gmail') || lower.includes('gmail') || lower.includes('email')) {
      return 'Opening Gmail...';
    }
    if (lower.startsWith('open google') || lower === 'google') {
      return 'Opening Google...';
    }
    if (lower.startsWith('open linkedin') || lower.includes('linkedin')) {
      return 'Opening LinkedIn...';
    }
    if (lower.startsWith('open instagram') || lower.includes('instagram')) {
      return 'Opening Instagram...';
    }
    if (lower.startsWith('open facebook') || lower.includes('facebook')) {
      return 'Opening Facebook...';
    }
    if (lower.startsWith('open chatgpt') || lower.includes('chatgpt') || lower.includes('chat gpt')) {
      return 'Opening ChatGPT...';
    }
    if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('go to ') || lower.startsWith('take me to ')) {
      const match = lower.replace(/^(?:open|launch|go to|take me to|visit)\s+/i, '').trim();
      return `Opening ${match.charAt(0).toUpperCase() + match.slice(1)}...`;
    }
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast') || lower.includes('raining')) {
      return 'Retrieving live weather...';
    }
    if (lower.includes('search') || lower.includes('latest') || lower.includes('news') || lower.includes('who won') || lower.includes('price')) {
      return 'Searching verified intelligence streams...';
    }
    return 'Processing directive...';
  };

  const handlePlusAction = (actionId: string, promptText?: string) => {
    if (promptText) {
      setInputText(promptText);
      inputRef.current?.focus();
    }
  };

  const handleCopy = (text: string, id: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsNote = async (cmd: CommandLog) => {
    soundFX.playClick();
    setSavingNoteId(cmd.id);
    try {
      const title = cmd.rawInput.length > 40 ? cmd.rawInput.slice(0, 37) + '...' : cmd.rawInput;
      await createNote({
        title: `Note: ${title}`,
        content: `**Command Query**: ${cmd.rawInput}\n\n**Gemini Intelligence Output**:\n${cmd.responseText}`,
        tags: ['Gemini', cmd.intent],
        pinned: false,
        color: 'cyan'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSavingNoteId(null), 1200);
    }
  };

  const handleConfirmClearChat = async () => {
    setClearErrorMessage(null);
    try {
      await clearChatMessages();
      setShowClearConfirmModal(false);
    } catch (err: any) {
      setClearErrorMessage(err.message || 'Failed to clear conversation.');
    }
  };

  // User display name from auth or default to 'Gautam'
  const userGreetingName = user?.displayName || 'Gautam';

  const getModelDisplayName = () => {
    switch (selectedModel) {
      case 'pro':
        return 'Pro';
      case 'thinking':
        return 'Thinking';
      case 'flash':
      default:
        return 'Flash';
    }
  };

  return (
    <section 
      id="gemini-main-canvas"
      className="flex-1 flex flex-col h-full bg-[#09090b] relative overflow-hidden select-none"
    >
      {/* Centered Ambient Dark Indigo/Blue Radial Lighting (matching screenshot) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-100"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(22, 40, 85, 0.45) 0%, rgba(10, 18, 40, 0.18) 55%, transparent 75%)'
        }}
      />

      {/* Floating Chat Notice Toast */}
      {chatNotice && (
        <div 
          id="chat-cleared-toast"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#16161a] border border-cyan-500/40 text-cyan-300 text-xs font-sans px-4 py-2 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.8)] flex items-center space-x-2 animate-in fade-in slide-in-from-top-2"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{chatNotice}</span>
        </div>
      )}

      {/* Top Bar with Minimalist Sparkle Action Button and Clear Chat Button */}
      <header className="h-14 shrink-0 flex items-center justify-between px-6 z-20">
        <div className="flex items-center space-x-2.5">
          {/* Subtle status indicator when in active conversation view */}
          {!isHomeView && (
            <button
              id="back-to-vibe-btn"
              onClick={clearActiveConversation}
              className="text-xs font-sans text-gray-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to vibe</span>
            </button>
          )}

          {/* Clearly visible Clear Chat button with trash icon */}
          {commandHistory.length > 0 && (
            <button
              id="clear-chat-btn"
              onClick={() => {
                soundFX.playClick();
                setClearErrorMessage(null);
                setShowClearConfirmModal(true);
              }}
              disabled={isClearingChat}
              className="text-xs font-sans text-gray-300 hover:text-red-400 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-red-500/10 transition-colors cursor-pointer border border-white/5 hover:border-red-500/30 group"
              title="Clear this conversation"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400 transition-colors" />
              <span className="font-medium">Clear Chat</span>
            </button>
          )}
        </div>

        {/* Top Right: Sparkle Pen / Format Toggle Icon */}
        <div className="relative">
          <button
            id="top-sparkle-btn"
            onClick={() => {
              soundFX.playClick();
              setShowFormatBar(!showFormatBar);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
            title="Text formatting & vibe controls"
          >
            <Sparkles className="w-4 h-4 text-gray-400 hover:text-cyan-300 transition-colors" />
          </button>

          {/* Optional Floating Text Format Popover */}
          {showFormatBar && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#1e1f20] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <TextFormatBar compact />
            </div>
          )}
        </div>
      </header>

      {/* Content View: EITHER Pristine Centered First Page OR Active Conversation Stream */}
      {isHomeView ? (
        /* ================= 1. PRISTINE FIRST PAGE HERO VIEW (JARVIS INTERFACE) ================= */
        <div 
          id="gemini-hero-first-page"
          className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 -mt-6"
        >
          {/* JARVIS Arc Reactor & System Badge */}
          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.15)] animate-in fade-in zoom-in-95">
            <JarvisLogo size={16} glow={true} className="animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-cyan-300">
              J.A.R.V.I.S. PROTOCOL // ONLINE
            </span>
          </div>

          {/* Centered Heading */}
          <h1 
            id="hero-greeting-heading"
            className="text-white text-3xl sm:text-4xl md:text-[42px] font-normal tracking-[-0.015em] font-sans text-center mb-8 sm:mb-10 antialiased"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white font-medium">{userGreetingName}</span>
          </h1>

          {/* Centered Main JARVIS Command Capsule */}
          <div className="w-full max-w-2xl lg:max-w-3xl relative group">
            {/* Ambient Cyan Aura */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-cyan-500/20 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />

            <form
              onSubmit={handleSubmit}
              className="w-full h-14 sm:h-16 bg-[#16171a] hover:bg-[#1a1b1f] focus-within:bg-[#18191d] rounded-full border border-cyan-500/30 focus-within:border-cyan-400/80 flex items-center px-3 sm:px-4 relative shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.08)] transition-all"
            >
              {/* Left Plus (+) Icon Button */}
              <div className="relative shrink-0">
                <button
                  id="capsule-plus-btn"
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowPlusMenu(!showPlusMenu);
                    setShowModelMenu(false);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  title="Tactical Tools & Attachments"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Plus Menu Dropdown */}
                {showPlusMenu && (
                  <PromptPlusMenu 
                    onSelectAction={handlePlusAction}
                    onClose={() => setShowPlusMenu(false)}
                  />
                )}
              </div>

              {/* Text Input Field */}
              <div className="flex-1 flex items-center px-2 sm:px-3 min-w-0">
                <input
                  id="gemini-ask-input"
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    assistantState === 'listening'
                      ? 'Listening to audio frequency...'
                      : `Prompt J.A.R.V.I.S...`
                  }
                  className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-gray-500 focus:placeholder-gray-400 font-sans tracking-wide"
                  autoFocus
                />
              </div>

              {/* Right Side Capsule Controls: Model Selector Pill + Mic Icon */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                {/* Model Selector Pill */}
                <div className="relative">
                  <button
                    id="model-pill-selector"
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setShowModelMenu(!showModelMenu);
                      setShowPlusMenu(false);
                    }}
                    className="h-8 sm:h-9 px-3 rounded-full bg-[#0d0e11] hover:bg-[#14161b] border border-cyan-500/20 hover:border-cyan-500/40 flex items-center space-x-1.5 transition-colors cursor-pointer select-none shadow-inner"
                    title="Select Neural Model"
                  >
                    {/* Cyan pulsating energy dot */}
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.9)] animate-pulse" />
                    <span className="text-xs font-sans text-gray-200 font-medium tracking-tight">
                      {getModelDisplayName()}
                    </span>
                    <ChevronDown className="w-3 h-3 text-cyan-400/70" />
                  </button>

                  {/* Model Selector Dropdown */}
                  {showModelMenu && (
                    <ModelSelectorMenu 
                      selectedModel={selectedModel}
                      onSelectModel={setSelectedModel}
                      onClose={() => setShowModelMenu(false)}
                    />
                  )}
                </div>

                {/* Send Button if text typed */}
                {inputText.trim() ? (
                  <button
                    id="capsule-send-btn"
                    type="submit"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-cyan-400 hover:bg-cyan-300 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-transform active:scale-95 cursor-pointer shrink-0 font-bold"
                    title="Transmit Directive"
                  >
                    <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
                  </button>
                ) : (
                  /* Microphone Voice Button */
                  <button
                    id="capsule-mic-btn"
                    type="button"
                    onClick={() => {
                      if (assistantState === 'listening') {
                        stopVoiceListening();
                      } else {
                        startVoiceListening();
                      }
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      assistantState === 'listening'
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                        : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10'
                    }`}
                    title={assistantState === 'listening' ? 'Stop Listening' : 'Voice Input'}
                  >
                    {assistantState === 'listening' ? (
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Subtle minimal helper hint */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 font-sans mt-4 select-none">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
            <span>Try saying: <span className="text-cyan-400/80 font-mono">"Open YouTube"</span>, <span className="text-cyan-400/80 font-mono">"Open WhatsApp"</span>, or <span className="text-cyan-400/80 font-mono">"Open Google Maps"</span></span>
          </div>
        </div>
      ) : (
        /* ================= 2. ACTIVE CONVERSATION STREAM VIEW ================= */
        <div 
          id="gemini-conversation-deck"
          className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10"
        >
          {/* Scrollable Conversation Stream */}
          <div 
            id="conversation-stream-scroll"
            className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 space-y-6 flex flex-col justify-start max-w-4xl mx-auto w-full"
          >
            {/* Command History Messages */}
            {commandHistory.slice().reverse().map((cmd) => (
              <div 
                key={cmd.id}
                id={`chat-message-${cmd.id}`}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                {/* User Prompt Bubble */}
                <div className="flex justify-end items-start space-x-3">
                  <div className="bg-[#1e1f20] border border-white/[0.08] text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-xl text-sm md:text-[15px] leading-relaxed font-sans shadow-lg">
                    {cmd.rawInput}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#6b4c3b] flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5 shadow-md">
                    {userGreetingName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* JARVIS AI Response Bubble */}
                <div className="flex justify-start items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                    <JarvisLogo size={18} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="bg-[#18181b]/90 border border-white/[0.06] rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xl">
                      {/* Intent & Security Verification Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider">
                            {cmd.intent.replace('_', ' ')}
                          </span>
                          {cmd.actionPayload?.targetCategory && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-400">
                              {cmd.actionPayload.targetCategory}
                            </span>
                          )}
                        </div>

                        {cmd.actionPayload?.url && (
                          <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400/90 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Allowlist Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Markdown Content */}
                      <MarkdownRenderer content={cmd.responseText} />

                      {/* Rich Action Launch Card (For Open Website or Web Search) */}
                      {cmd.actionPayload?.url && (
                        <div className="mt-4 p-3.5 rounded-xl bg-[#111215] border border-cyan-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.06] border border-white/10 shrink-0"
                              style={{ color: cmd.actionPayload.color || '#00F0FF' }}
                            >
                              <ExternalLink className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-white truncate font-sans">
                                {cmd.actionPayload.targetName || 'Operational Target'}
                              </div>
                              <div className="text-[11px] text-cyan-300/70 font-mono truncate max-w-xs sm:max-w-md">
                                {cmd.actionPayload.url}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <a
                              href={cmd.actionPayload.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer font-sans"
                            >
                              <span>Launch {cmd.actionPayload.targetName || 'Target'}</span>
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Verified Sources if Web Search */}
                      {cmd.searchSources && cmd.searchSources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
                          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Grounding Sources ({cmd.searchSources.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cmd.searchSources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-xs bg-black/40 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-cyan-200 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <span className="truncate max-w-[200px]">{src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400 pl-1">
                      {/* Speech audio playback */}
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeech();
                          } else {
                            speakText(cmd.speakableText || cmd.responseText);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                        title={isSpeaking ? 'Stop voice readout' : 'Read aloud with speech synthesis'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      {/* Copy response */}
                      <button
                        onClick={() => handleCopy(cmd.responseText, cmd.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                        title="Copy to clipboard"
                      >
                        {copiedId === cmd.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      {/* Bookmark / Save to Notes */}
                      <button
                        onClick={() => handleSaveAsNote(cmd)}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                        title="Save to Notes Vault"
                      >
                        {savingNoteId === cmd.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[11px] text-cyan-400">Saved</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Save Note</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-gray-500 font-mono ml-auto">
                        {cmd.executionTimeMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pending User Query Bubble (while processing) */}
            {assistantState === 'processing' && pendingQuery && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex justify-end items-start space-x-3">
                  <div className="bg-[#1e1f20] border border-white/[0.08] text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-xl text-sm md:text-[15px] leading-relaxed font-sans shadow-lg">
                    {pendingQuery}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#6b4c3b] flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5 shadow-md">
                    {userGreetingName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Processing State with dynamic contextual message */}
                <div className="flex justify-start items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_12px_rgba(0,240,255,0.3)] animate-pulse">
                    <JarvisLogo size={18} />
                  </div>
                  <div className="bg-[#18181b]/90 border border-white/[0.06] rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xl flex items-center space-x-3 max-w-md">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-sans">
                      {getLoadingMessage(pendingQuery)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live voice transcript indicator */}
            {assistantState === 'listening' && (
              <div className="flex items-center space-x-3 p-4 bg-white/[0.04] border border-white/10 rounded-2xl animate-pulse">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs text-gray-300 font-sans">
                  {currentTranscript || 'Listening to your voice command...'}
                </span>
              </div>
            )}

            {/* Generic processing indicator when pendingQuery is not explicitly set */}
            {assistantState === 'processing' && !pendingQuery && (
              <div className="flex items-center space-x-3 p-4 bg-white/[0.04] border border-white/10 rounded-2xl">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs text-cyan-300 font-sans">
                  Thinking...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Docked Bottom Command Capsule */}
          <div className="p-4 sm:p-6 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent relative z-20">
            <div className="max-w-4xl mx-auto w-full relative group">
              {/* Ambient Cyan Aura */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/15 via-sky-500/10 to-cyan-500/15 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />

              <form
                onSubmit={handleSubmit}
                className="w-full h-14 sm:h-16 bg-[#16171a] hover:bg-[#1a1b1f] focus-within:bg-[#18191d] rounded-full border border-cyan-500/30 focus-within:border-cyan-400/80 flex items-center px-3 sm:px-4 relative shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.08)] transition-all"
              >
                {/* Left Plus (+) Icon Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setShowPlusMenu(!showPlusMenu);
                      setShowModelMenu(false);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                    title="Tactical Tools & Attachments"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {showPlusMenu && (
                    <PromptPlusMenu 
                      onSelectAction={handlePlusAction}
                      onClose={() => setShowPlusMenu(false)}
                    />
                  )}
                </div>

                {/* Text Input Field */}
                <div className="flex-1 flex items-center px-2 sm:px-3 min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      assistantState === 'listening'
                        ? 'Listening to audio frequency...'
                        : 'Prompt J.A.R.V.I.S...'
                    }
                    className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-gray-500 focus:placeholder-gray-400 font-sans tracking-wide"
                  />
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                  {/* Model Selector Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setShowModelMenu(!showModelMenu);
                        setShowPlusMenu(false);
                      }}
                      className="h-8 sm:h-9 px-3 rounded-full bg-[#0d0e11] hover:bg-[#14161b] border border-cyan-500/20 hover:border-cyan-500/40 flex items-center space-x-1.5 transition-colors cursor-pointer select-none shadow-inner"
                      title="Select Neural Model"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.9)] animate-pulse" />
                      <span className="text-xs font-sans text-gray-200 font-medium tracking-tight">
                        {getModelDisplayName()}
                      </span>
                      <ChevronDown className="w-3 h-3 text-cyan-400/70" />
                    </button>

                    {showModelMenu && (
                      <ModelSelectorMenu 
                        selectedModel={selectedModel}
                        onSelectModel={setSelectedModel}
                        onClose={() => setShowModelMenu(false)}
                      />
                    )}
                  </div>

                  {inputText.trim() ? (
                    <button
                      type="submit"
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-cyan-400 hover:bg-cyan-300 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-transform active:scale-95 cursor-pointer shrink-0 font-bold"
                      title="Transmit Directive"
                    >
                      <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (assistantState === 'listening') {
                          stopVoiceListening();
                        } else {
                          startVoiceListening();
                        }
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        assistantState === 'listening'
                          ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                          : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10'
                      }`}
                      title={assistantState === 'listening' ? 'Stop Listening' : 'Voice Input'}
                    >
                      {assistantState === 'listening' ? (
                        <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Dialog Modal */}
      {showClearConfirmModal && (
        <div 
          id="clear-chat-modal-overlay"
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div 
            id="clear-chat-confirmation-card"
            className="bg-[#111114] border border-red-500/30 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.18)] space-y-5 relative overflow-hidden"
          >
            {/* Top red glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-16 bg-red-500/20 blur-3xl pointer-events-none" />

            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Clear Conversation?
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Are you sure you want to clear this conversation? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-[#16161a] border border-[#1f1f23] rounded-2xl p-3.5 text-[11px] text-gray-400 font-mono space-y-1">
              <div className="flex items-center space-x-1.5 text-red-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Permanent Database Action</span>
              </div>
              <p className="text-gray-500">
                All messages in this conversation session will be permanently erased. Saved notes and vault documents will remain intact.
              </p>
            </div>

            {clearErrorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {clearErrorMessage}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                id="cancel-clear-chat-btn"
                type="button"
                disabled={isClearingChat}
                onClick={() => {
                  soundFX.playClick();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-sans text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-chat-btn"
                type="button"
                disabled={isClearingChat}
                onClick={handleConfirmClearChat}
                className="px-4 py-2.5 rounded-xl text-xs font-sans font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors cursor-pointer flex items-center space-x-2 shadow-lg shadow-red-600/30"
              >
                {isClearingChat ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Chat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
