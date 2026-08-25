export type FontFamilyChoice = 'space-grotesk' | 'rajdhani' | 'jetbrains-mono' | 'jakarta' | 'system';
export type FontSizeChoice = 'compact' | 'standard' | 'comfortable' | 'expansive';
export type RenderModeChoice = 'rich_markdown' | 'cyber_tactical' | 'raw_terminal';
export type LineSpacingChoice = 'tight' | 'normal' | 'relaxed';

export interface TextFormatSettings {
  fontFamily: FontFamilyChoice;
  fontSize: FontSizeChoice;
  renderMode: RenderModeChoice;
  lineSpacing: LineSpacingChoice;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  callsign: string;
  themeColor: 'cyan' | 'amber' | 'emerald' | 'violet' | 'crimson';
  voiceSettings: {
    pitch: number;
    rate: number;
    voiceName?: string;
    autoSpeak: boolean;
    soundEffects: boolean;
  };
  textFormatSettings?: TextFormatSettings;
  assistantStyle: 'butler' | 'technical' | 'concise' | 'creative';
  createdAt: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export type CommandIntent =
  | 'open_website'
  | 'web_search'
  | 'app_navigation'
  | 'ai_chat'
  | 'weather'
  | 'save_note'
  | 'view_notes'
  | 'show_history'
  | 'system_status'
  | 'calculate'
  | 'reminder'
  | 'clear_history'
  | 'unsupported';

export interface ActionPayload {
  type?: 'open_url' | 'search_web' | 'navigate_tab' | 'save_note' | 'clear_history' | 'diagnostic' | 'unsupported';
  target?: string;
  targetName?: string;
  targetCategory?: string;
  url?: string;
  query?: string;
  tab?: TabType;
  icon?: string;
  color?: string;
  noteId?: string;
  noteTitle?: string;
  desktopSupported?: boolean;
  desktopProtocol?: string;
  openedSuccessfully?: boolean;
}

export interface CommandLog {
  id: string;
  userId: string;
  rawInput: string;
  intent: CommandIntent;
  status: 'success' | 'error' | 'processing';
  responseText: string;
  speakableText: string;
  executionTimeMs: number;
  tokensUsed?: number;
  searchSources?: SearchSource[];
  actionPayload?: ActionPayload;
  createdAt: string;
}

export interface RegisteredTarget {
  id: string;
  name: string;
  aliases: string[];
  category: 'productivity' | 'social' | 'media' | 'developer' | 'utility' | 'ai';
  baseUrl: string;
  searchUrlTemplate?: string;
  desktopProtocol?: string;
  icon: string;
  accentColor: string;
  description: string;
}

export interface RegisteredCommand {
  id: string;
  name: string;
  intent: CommandIntent;
  description: string;
  examples: string[];
  category: 'web' | 'search' | 'system' | 'ai' | 'notes';
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryData {
  status: string;
  systemName: string;
  version: string;
  geminiEngine: string;
  uptimeSeconds: number;
  memoryUsageMB: number;
  cpuLoadPercent: number;
  telemetryStats: {
    totalUsers: number;
    totalCommands: number;
    totalNotes: number;
    uptimeSeconds: number;
    memoryUsageMB: number;
  };
  serverTime: string;
}

export type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking';

export type TabType = 'command' | 'history' | 'notes' | 'intelligence' | 'telemetry';
