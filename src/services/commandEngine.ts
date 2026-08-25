import { CommandLog, CommandIntent, ActionPayload } from '../types';
import { 
  matchCommandIntent, 
  isAllowedUrl, 
  SUPPORTED_TARGETS, 
  findTarget,
  cleanVoicePrefix
} from './commandRegistry';
import { api } from './api';
import { soundFX } from './sound';

export interface CommandExecutionResult {
  command: CommandLog;
  intent: CommandIntent;
  actionPayload?: ActionPayload;
  speakableText: string;
  responseText: string;
  targetUrl?: string;
  createdNote?: any;
}

export class CommandEngine {
  /**
   * Safely open an allowlisted target URL in a new browser tab/window.
   * Handles iframe restrictions and browser popup blockers gracefully.
   */
  public safeOpenUrl(url: string, targetName: string = 'Target'): boolean {
    if (!isAllowedUrl(url)) {
      console.warn(`[CommandEngine] Blocked unsafe or unallowlisted URL: ${url}`);
      return false;
    }

    try {
      // In web preview environments, window.open with noopener,noreferrer
      const newTab = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        // Fallback: create temporary safe anchor
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return true;
    } catch (err) {
      console.error(`[CommandEngine] Error opening URL for ${targetName}:`, err);
      return false;
    }
  }

  /**
   * Main Command Execution Pipeline
   * Processes both Voice and Typed commands through the exact same logic.
   */
  public async processCommand(
    rawInput: string,
    context: {
      userId: string;
      displayName: string;
      callsign: string;
      modelName: string;
      onNavigateTab?: (tab: any) => void;
      onHomeViewToggle?: (isHome: boolean) => void;
    }
  ): Promise<CommandExecutionResult> {
    const startTime = Date.now();
    const cleaned = cleanVoicePrefix(rawInput);
    const callsign = context.callsign || 'Sir';

    // 1. Check local pattern match & intent classification
    const matched = matchCommandIntent(rawInput, callsign);

    // If it's an OPEN_WEBSITE intent with allowlisted URL
    if (matched.intent === 'open_website' && matched.actionPayload?.url) {
      const targetUrl = matched.actionPayload.url;
      const targetName = matched.actionPayload.targetName || 'Website';
      
      const opened = this.safeOpenUrl(targetUrl, targetName);
      matched.actionPayload.openedSuccessfully = opened;

      // Log to backend storage via API
      try {
        const serverRes = await api.commands.execute(rawInput, context.modelName);
        return {
          command: {
            ...serverRes.command,
            intent: 'open_website',
            actionPayload: matched.actionPayload
          },
          intent: 'open_website',
          actionPayload: matched.actionPayload,
          speakableText: matched.speakableText,
          responseText: matched.responseText,
          targetUrl
        };
      } catch {
        // Local fallback log if offline
        const localLog: CommandLog = {
          id: 'cmd_' + Date.now().toString(36),
          userId: context.userId,
          rawInput,
          intent: 'open_website',
          status: 'success',
          responseText: matched.responseText,
          speakableText: matched.speakableText,
          executionTimeMs: Date.now() - startTime,
          actionPayload: matched.actionPayload,
          createdAt: new Date().toISOString()
        };
        return {
          command: localLog,
          intent: 'open_website',
          actionPayload: matched.actionPayload,
          speakableText: matched.speakableText,
          responseText: matched.responseText,
          targetUrl
        };
      }
    }

    // If it's a WEB_SEARCH intent on specific provider (e.g. YouTube, GitHub, Google)
    if (matched.intent === 'web_search' && matched.actionPayload?.url) {
      const targetUrl = matched.actionPayload.url;
      const targetName = matched.actionPayload.targetName || 'Search Engine';
      
      const opened = this.safeOpenUrl(targetUrl, targetName);
      matched.actionPayload.openedSuccessfully = opened;

      try {
        const serverRes = await api.commands.execute(rawInput, context.modelName);
        return {
          command: {
            ...serverRes.command,
            intent: 'web_search',
            actionPayload: matched.actionPayload
          },
          intent: 'web_search',
          actionPayload: matched.actionPayload,
          speakableText: matched.speakableText,
          responseText: matched.responseText,
          targetUrl
        };
      } catch {
        const localLog: CommandLog = {
          id: 'cmd_' + Date.now().toString(36),
          userId: context.userId,
          rawInput,
          intent: 'web_search',
          status: 'success',
          responseText: matched.responseText,
          speakableText: matched.speakableText,
          executionTimeMs: Date.now() - startTime,
          actionPayload: matched.actionPayload,
          createdAt: new Date().toISOString()
        };
        return {
          command: localLog,
          intent: 'web_search',
          actionPayload: matched.actionPayload,
          speakableText: matched.speakableText,
          responseText: matched.responseText,
          targetUrl
        };
      }
    }

    // If it's an In-App Navigation intent
    if (matched.intent === 'app_navigation' && matched.actionPayload?.tab) {
      if (context.onNavigateTab) {
        context.onNavigateTab(matched.actionPayload.tab);
      }
      if (context.onHomeViewToggle && matched.actionPayload.tab === 'command') {
        context.onHomeViewToggle(true);
      }

      const localLog: CommandLog = {
        id: 'cmd_' + Date.now().toString(36),
        userId: context.userId,
        rawInput,
        intent: 'app_navigation',
        status: 'success',
        responseText: matched.responseText,
        speakableText: matched.speakableText,
        executionTimeMs: Date.now() - startTime,
        actionPayload: matched.actionPayload,
        createdAt: new Date().toISOString()
      };

      try {
        await api.commands.execute(rawInput, context.modelName);
      } catch {}

      return {
        command: localLog,
        intent: 'app_navigation',
        actionPayload: matched.actionPayload,
        speakableText: matched.speakableText,
        responseText: matched.responseText
      };
    }

    // If it's an Unsupported Command
    if (matched.intent === 'unsupported') {
      const unsupportedLog: CommandLog = {
        id: 'cmd_uns_' + Date.now().toString(36),
        userId: context.userId,
        rawInput,
        intent: 'unsupported',
        status: 'error',
        responseText: matched.responseText,
        speakableText: matched.speakableText,
        executionTimeMs: Date.now() - startTime,
        actionPayload: matched.actionPayload,
        createdAt: new Date().toISOString()
      };

      return {
        command: unsupportedLog,
        intent: 'unsupported',
        actionPayload: matched.actionPayload,
        speakableText: matched.speakableText,
        responseText: matched.responseText
      };
    }

    // For all other commands (AI Chat, Deep Grounded Web Search, Notes Vault, Weather, Diagnostics, Calculations):
    // Execute through the server-side AI & Storage pipeline
    const serverRes = await api.commands.execute(rawInput, context.modelName);
    
    // Check if server response intent needs tab navigation
    if (serverRes.intent === 'view_notes' && context.onNavigateTab) {
      context.onNavigateTab('notes');
    } else if (serverRes.intent === 'show_history' && context.onNavigateTab) {
      context.onNavigateTab('history');
    } else if (serverRes.intent === 'system_status' && context.onNavigateTab) {
      context.onNavigateTab('intelligence');
    }

    return {
      command: serverRes.command,
      intent: serverRes.intent,
      actionPayload: serverRes.command.actionPayload,
      speakableText: serverRes.speakableText || serverRes.command.speakableText,
      responseText: serverRes.responseText || serverRes.command.responseText,
      createdNote: serverRes.createdNote
    };
  }
}

export const commandEngine = new CommandEngine();
