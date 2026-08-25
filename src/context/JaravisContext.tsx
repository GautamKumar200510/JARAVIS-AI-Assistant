import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CommandLog, Note, TelemetryData, AssistantState, TabType, TextFormatSettings, SearchSource, CommandIntent } from '../types';
import { api } from '../services/api';
import { soundFX } from '../services/sound';
import { speechService } from '../services/speech';
import { commandEngine } from '../services/commandEngine';
import { matchCommandIntent } from '../services/commandRegistry';
import { useAuth } from './AuthContext';

interface JaravisContextType {
  assistantState: AssistantState;
  activeCommand: CommandLog | null;
  commandHistory: CommandLog[];
  notes: Note[];
  telemetry: TelemetryData | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentTranscript: string;
  isMicAvailable: boolean;
  isSpeaking: boolean;
  voiceAutoSpeak: boolean;
  setVoiceAutoSpeak: (val: boolean) => void;
  soundEffectsEnabled: boolean;
  setSoundEffectsEnabled: (val: boolean) => void;
  textFormatSettings: TextFormatSettings;
  updateTextFormatSettings: (settings: Partial<TextFormatSettings>) => void;
  fontClass: string;
  fontSizeClass: string;
  lineSpacingClass: string;
  settingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  selectedModel: 'flash' | 'pro' | 'thinking';
  setSelectedModel: (model: 'flash' | 'pro' | 'thinking') => void;
  isHomeView: boolean;
  setIsHomeView: (val: boolean) => void;
  clearActiveConversation: () => void;
  isClearingChat: boolean;
  chatNotice: string | null;
  setChatNotice: (val: string | null) => void;
  clearChatMessages: () => Promise<{ success: boolean; message: string }>;
  executeCommand: (cmdText: string) => Promise<CommandLog | null>;
  // Streaming AI capabilities
  isStreaming: boolean;
  streamingContent: string;
  streamingSources: SearchSource[];
  streamingIntent: CommandIntent | null;
  streamingQuery: string | null;
  stopGenerating: () => void;
  retryLastCommand: () => void;
  retryCommand: (cmdText: string) => void;
  // Voice listening
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  loadHistory: () => Promise<void>;
  loadNotes: () => Promise<void>;
  refreshTelemetry: () => Promise<void>;
  createNote: (data: { title: string; content: string; tags?: string[]; pinned?: boolean; color?: string }) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  deleteCommand: (id: string) => Promise<void>;
  clearCommandHistory: () => Promise<void>;
}

const JaravisContext = createContext<JaravisContextType | undefined>(undefined);

const DEFAULT_TEXT_FORMAT: TextFormatSettings = {
  fontFamily: 'space-grotesk',
  fontSize: 'standard',
  renderMode: 'rich_markdown',
  lineSpacing: 'normal'
};

export function JaravisProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [activeCommand, setActiveCommand] = useState<CommandLog | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandLog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('command');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isMicAvailable, setIsMicAvailable] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro' | 'thinking'>('flash');
  const [isHomeView, setIsHomeView] = useState<boolean>(true);
  const [isClearingChat, setIsClearingChat] = useState<boolean>(false);
  const [chatNotice, setChatNotice] = useState<string | null>(null);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingSources, setStreamingSources] = useState<SearchSource[]>([]);
  const [streamingIntent, setStreamingIntent] = useState<CommandIntent | null>(null);
  const [streamingQuery, setStreamingQuery] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  // Settings derived from user or local defaults
  const [voiceAutoSpeak, setVoiceAutoSpeakState] = useState<boolean>(true);
  const [soundEffectsEnabled, setSoundEffectsEnabledState] = useState<boolean>(true);
  const [textFormatSettings, setTextFormatSettingsState] = useState<TextFormatSettings>(() => {
    try {
      const saved = localStorage.getItem('jaravis_text_format');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEXT_FORMAT;
  });

  // Sync settings with user profile
  useEffect(() => {
    if (user?.voiceSettings) {
      setVoiceAutoSpeakState(user.voiceSettings.autoSpeak ?? true);
      setSoundEffectsEnabledState(user.voiceSettings.soundEffects ?? true);
      soundFX.setEnabled(user.voiceSettings.soundEffects ?? true);
    }
    if (user?.textFormatSettings) {
      setTextFormatSettingsState(user.textFormatSettings);
    }
  }, [user]);

  const updateTextFormatSettings = (updates: Partial<TextFormatSettings>) => {
    soundFX.playClick();
    setTextFormatSettingsState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('jaravis_text_format', JSON.stringify(next));
      } catch {}
      if (user) {
        updateProfile({
          textFormatSettings: next
        });
      }
      return next;
    });
  };

  const getFontClass = () => {
    switch (textFormatSettings.fontFamily) {
      case 'rajdhani':
        return 'font-rajdhani';
      case 'jetbrains-mono':
        return 'font-jetbrains';
      case 'jakarta':
        return 'font-jakarta';
      case 'system':
        return 'font-system';
      case 'space-grotesk':
      default:
        return 'font-space';
    }
  };

  const getFontSizeClass = () => {
    switch (textFormatSettings.fontSize) {
      case 'compact':
        return 'text-xs sm:text-sm';
      case 'large':
        return 'text-base sm:text-lg';
      case 'standard':
      default:
        return 'text-sm sm:text-base';
    }
  };

  const getLineSpacingClass = () => {
    switch (textFormatSettings.lineSpacing) {
      case 'tight':
        return 'leading-snug';
      case 'relaxed':
        return 'leading-relaxed';
      case 'normal':
      default:
        return 'leading-normal';
    }
  };

  const setVoiceAutoSpeak = (val: boolean) => {
    setVoiceAutoSpeakState(val);
    if (user) {
      updateProfile({
        voiceSettings: {
          ...user.voiceSettings,
          autoSpeak: val
        }
      });
    }
  };

  const setSoundEffectsEnabled = (val: boolean) => {
    setSoundEffectsEnabledState(val);
    soundFX.setEnabled(val);
    if (user) {
      updateProfile({
        voiceSettings: {
          ...user.voiceSettings,
          soundEffects: val
        }
      });
    }
  };

  // Load initial data
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.commands.getHistory({ limit: 100 });
      setCommandHistory(res.commands);
      if (res.commands.length > 0) {
        setActiveCommand(res.commands[0]);
      }
    } catch (err) {
      console.warn('Could not load command history:', err);
    }
  }, [isAuthenticated]);

  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.notes.getAll();
      setNotes(res.notes);
    } catch (err) {
      console.warn('Could not load notes:', err);
    }
  }, [isAuthenticated]);

  const refreshTelemetry = useCallback(async () => {
    try {
      const data = await api.system.getTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.warn('Could not refresh telemetry:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
      loadNotes();
      refreshTelemetry();
    }
  }, [isAuthenticated, loadHistory, loadNotes, refreshTelemetry]);

  // Periodic telemetry update
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTelemetry();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Check microphone availability on mount
  useEffect(() => {
    setIsMicAvailable(speechService.isRecognitionSupported());
  }, []);

  // Text-To-Speech
  const speakText = useCallback(
    (text: string) => {
      if (!text || !speechService.isSynthesisSupported()) return;

      speechService.speak(text, {
        pitch: user?.voiceSettings?.pitch ?? 1.0,
        rate: user?.voiceSettings?.rate ?? 1.05,
        voiceName: user?.voiceSettings?.voiceName,
        onStart: () => {
          setAssistantState('speaking');
          setIsSpeaking(true);
        },
        onEnd: () => {
          setAssistantState('idle');
          setIsSpeaking(false);
        },
        onError: () => {
          setAssistantState('idle');
          setIsSpeaking(false);
        }
      });
    },
    [user]
  );

  const stopSpeech = useCallback(() => {
    speechService.stopSpeaking();
    setAssistantState('idle');
    setIsSpeaking(false);
  }, []);

  // Stop active AI generation stream
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setAssistantState('idle');
    soundFX.playClick();
  }, []);

  const clearActiveConversation = useCallback(() => {
    stopGenerating();
    setIsHomeView(true);
    setActiveCommand(null);
    stopSpeech();
    soundFX.playClick();
  }, [stopGenerating, stopSpeech]);

  // Complete Clear Chat with database synchronization & state reset
  const clearChatMessages = useCallback(async () => {
    stopGenerating();
    setIsClearingChat(true);
    stopSpeech();
    try {
      const res = await api.chat.clear();
      setCommandHistory([]);
      setActiveCommand(null);
      setIsHomeView(true);
      setCurrentTranscript('');
      const friendlyMsg = res.message || 'Chat cleared. How can I help you?';
      setChatNotice(friendlyMsg);
      soundFX.playSuccess();
      setTimeout(() => {
        setChatNotice(null);
      }, 6000);
      return { success: true, message: friendlyMsg };
    } catch (err: any) {
      soundFX.playError();
      const errMsg = err.message || 'Failed to clear chat from database.';
      throw new Error(errMsg);
    } finally {
      setIsClearingChat(false);
    }
  }, [stopGenerating, stopSpeech]);

  // High-Performance Streaming Command Execution Pipeline
  const executeCommand = useCallback(
    async (cmdText: string): Promise<CommandLog | null> => {
      const trimmed = cmdText.trim();
      if (!trimmed) return null;

      lastQueryRef.current = trimmed;
      stopSpeech();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsHomeView(false);
      setAssistantState('processing');
      soundFX.playProcessingBeep();

      const callsign = user?.callsign || 'Sir';
      const modelName = selectedModel === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.7-flash';

      // 1. Check local instant match (e.g. Open YouTube, Open WhatsApp, Tab Nav)
      const matched = matchCommandIntent(trimmed, callsign);
      if (
        matched.intent === 'open_website' || 
        (matched.intent === 'web_search' && matched.actionPayload?.url) || 
        matched.intent === 'app_navigation' || 
        matched.intent === 'unsupported'
      ) {
        try {
          const res = await commandEngine.processCommand(trimmed, {
            userId: user?.id || 'guest',
            displayName: user?.displayName || 'Guest Operative',
            callsign,
            modelName,
            onNavigateTab: (tab) => setActiveTab(tab),
            onHomeViewToggle: (isHome) => setIsHomeView(isHome)
          });

          setActiveCommand(res.command);
          setCommandHistory(prev => [res.command, ...prev.filter(c => c.id !== res.command.id)]);

          if (res.command.status === 'error' || res.intent === 'unsupported') {
            soundFX.playError();
          } else {
            soundFX.playSuccess();
          }

          if (voiceAutoSpeak && res.speakableText) {
            speakText(res.speakableText);
          } else {
            setAssistantState('idle');
          }

          return res.command;
        } catch (err: any) {
          soundFX.playError();
          setAssistantState('idle');
          return null;
        }
      }

      // 2. Stream AI, Search, Weather, and Calculations via SSE
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsStreaming(true);
      setStreamingQuery(trimmed);
      setStreamingContent('');
      setStreamingSources([]);
      setStreamingIntent(null);

      try {
        let finalCommandLog: CommandLog | null = null;
        let speakableSummary: string = '';

        await api.commands.streamExecute(
          trimmed,
          {
            onStart: () => {
              setAssistantState('processing');
            },
            onIntent: (data) => {
              setStreamingIntent(data.intent);
              if (data.intent === 'view_notes') {
                setActiveTab('notes');
              } else if (data.intent === 'show_history') {
                setActiveTab('history');
              } else if (data.intent === 'system_status') {
                setActiveTab('intelligence');
              }
            },
            onChunk: (data) => {
              setStreamingContent(data.textSoFar);
            },
            onSources: (data) => {
              setStreamingSources(data.sources);
            },
            onDone: (data) => {
              finalCommandLog = data.command;
              speakableSummary = data.speakableText;

              setActiveCommand(data.command);
              setCommandHistory(prev => [data.command, ...prev.filter(c => c.id !== data.command.id)]);

              if (data.createdNote) {
                setNotes(prev => [data.createdNote!, ...prev.filter(n => n.id !== data.createdNote!.id)]);
              }

              if (data.intent === 'clear_history') {
                setCommandHistory([]);
              }

              soundFX.playSuccess();
            },
            onError: (err) => {
              console.warn('[JaravisContext] Stream error:', err);
              soundFX.playError();
            }
          },
          {
            model: modelName,
            signal: abortController.signal
          }
        );

        setIsStreaming(false);
        setStreamingQuery(null);
        abortControllerRef.current = null;

        if (voiceAutoSpeak && speakableSummary) {
          speakText(speakableSummary);
        } else {
          setAssistantState('idle');
        }

        return finalCommandLog;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[JaravisContext] Execution stream exception:', err);
          soundFX.playError();
        }
        setIsStreaming(false);
        setStreamingQuery(null);
        setAssistantState('idle');
        abortControllerRef.current = null;
        return null;
      }
    },
    [user, selectedModel, voiceAutoSpeak, speakText, stopSpeech]
  );

  // Retry command functions
  const retryLastCommand = useCallback(() => {
    if (lastQueryRef.current) {
      executeCommand(lastQueryRef.current);
    }
  }, [executeCommand]);

  const retryCommand = useCallback((cmdText: string) => {
    if (cmdText) {
      executeCommand(cmdText);
    }
  }, [executeCommand]);

  // Speech Recognition Start/Stop
  const startVoiceListening = useCallback(() => {
    if (!speechService.isRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    stopSpeech();
    stopGenerating();
    soundFX.playListeningStart();
    setAssistantState('listening');
    setCurrentTranscript('');

    speechService.startListening({
      onStart: () => {
        setAssistantState('listening');
      },
      onResult: (transcript: string, isFinal: boolean) => {
        setCurrentTranscript(transcript);
        if (isFinal && transcript.trim()) {
          speechService.stopListening();
          executeCommand(transcript.trim());
        }
      },
      onError: (err: string) => {
        console.warn('Speech recognition error:', err);
        setAssistantState('idle');
        soundFX.playError();
      },
      onEnd: () => {
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      }
    });
  }, [assistantState, executeCommand, stopGenerating, stopSpeech]);

  const stopVoiceListening = useCallback(() => {
    speechService.stopListening();
    if (currentTranscript.trim()) {
      executeCommand(currentTranscript.trim());
    } else {
      setAssistantState('idle');
    }
  }, [currentTranscript, executeCommand]);

  // Notes operations
  const createNote = async (data: { title: string; content: string; tags?: string[]; pinned?: boolean; color?: string }) => {
    const res = await api.notes.create(data);
    setNotes(prev => [res.note, ...prev]);
    soundFX.playSuccess();
    return res.note;
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    const res = await api.notes.update(id, data);
    setNotes(prev => prev.map(n => (n.id === id ? res.note : n)));
    soundFX.playClick();
    return res.note;
  };

  const deleteNote = async (id: string) => {
    await api.notes.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    soundFX.playClick();
  };

  const togglePinNote = async (id: string) => {
    const res = await api.notes.togglePin(id);
    setNotes(prev =>
      prev
        .map(n => (n.id === id ? res.note : n))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
    );
    soundFX.playClick();
  };

  // Command logs operations
  const deleteCommand = async (id: string) => {
    await api.commands.deleteItem(id);
    setCommandHistory(prev => prev.filter(c => c.id !== id));
    if (activeCommand?.id === id) {
      setActiveCommand(null);
    }
    soundFX.playClick();
  };

  const clearCommandHistory = async () => {
    await api.commands.clearAll();
    setCommandHistory([]);
    setActiveCommand(null);
    soundFX.playClick();
  };

  const value = {
    assistantState,
    activeCommand,
    commandHistory,
    notes,
    telemetry,
    activeTab,
    setActiveTab,
    currentTranscript,
    isMicAvailable,
    isSpeaking,
    voiceAutoSpeak,
    setVoiceAutoSpeak,
    soundEffectsEnabled,
    setSoundEffectsEnabled,
    textFormatSettings,
    updateTextFormatSettings,
    fontClass: getFontClass(),
    fontSizeClass: getFontSizeClass(),
    lineSpacingClass: getLineSpacingClass(),
    settingsOpen,
    setSettingsOpen,
    selectedModel,
    setSelectedModel,
    isHomeView,
    setIsHomeView,
    clearActiveConversation,
    isClearingChat,
    chatNotice,
    setChatNotice,
    clearChatMessages,
    executeCommand,
    isStreaming,
    streamingContent,
    streamingSources,
    streamingIntent,
    streamingQuery,
    stopGenerating,
    retryLastCommand,
    retryCommand,
    startVoiceListening,
    stopVoiceListening,
    speakText,
    stopSpeech,
    loadHistory,
    loadNotes,
    refreshTelemetry,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    deleteCommand,
    clearCommandHistory
  };

  return <JaravisContext.Provider value={value}>{children}</JaravisContext.Provider>;
}

export function useJaravis() {
  const context = useContext(JaravisContext);
  if (!context) {
    throw new Error('useJaravis must be used within a JaravisProvider');
  }
  return context;
}
