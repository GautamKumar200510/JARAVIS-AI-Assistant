import { storage, CommandLog, Note, SearchSource, StorageCommandIntent } from '../storage';
import { aiService, ConversationTurn } from './aiService';
import { weatherService } from './weatherService';
import { webSearchService } from './webSearchService';
import { 
  findTarget, 
  isAllowedUrl, 
  cleanVoicePrefix, 
  SUPPORTED_TARGETS, 
  RegisteredTarget 
} from './commandRegistry';

export interface CommandProcessResult {
  intent: StorageCommandIntent;
  status: 'success' | 'error' | 'unsupported';
  responseText: string;
  speakableText: string;
  searchSources?: SearchSource[];
  createdNote?: Note;
  actionPayload?: any;
  executionTimeMs: number;
}

export class CommandService {
  /**
   * Fetch recent conversation context turns for the user
   */
  public getRecentHistory(userId: string, limit: number = 6): ConversationTurn[] {
    const logs = storage.getCommandsByUserId(userId);
    const turns: ConversationTurn[] = [];

    // Filter relevant conversation turns
    const relevantLogs = logs
      .filter(l => l.intent === 'ai_chat' || l.intent === 'web_search' || l.intent === 'calculate' || l.intent === 'weather')
      .slice(0, limit)
      .reverse();

    for (const log of relevantLogs) {
      if (log.rawInput && log.responseText) {
        turns.push({ role: 'user', text: log.rawInput });
        // Truncate long past responses to avoid context bloat
        const truncatedModel = log.responseText.length > 500 ? log.responseText.slice(0, 497) + '...' : log.responseText;
        turns.push({ role: 'model', text: truncatedModel });
      }
    }

    return turns;
  }

  /**
   * Classify user query intent with high accuracy
   */
  public classifyIntent(input: string, callsign: string = 'Sir'): {
    intent: StorageCommandIntent;
    target?: RegisteredTarget;
    actionPayload?: any;
    metadata?: any;
    customResponse?: {
      responseText: string;
      speakableText: string;
      status?: 'success' | 'error' | 'unsupported';
    };
  } {
    const cleaned = cleanVoicePrefix(input);
    const lower = cleaned.toLowerCase().trim();

    // 1. History commands
    if (
      lower === 'clear history' ||
      lower === 'clear all history' ||
      lower === 'delete command history' ||
      lower === 'wipe history' ||
      lower.startsWith('clear command history') ||
      lower.startsWith('flush logs')
    ) {
      return { intent: 'clear_history' };
    }

    if (
      lower === 'show history' ||
      lower === 'show my command history' ||
      lower === 'show command history' ||
      lower === 'command history' ||
      lower === 'show commands' ||
      lower.startsWith('show my previous commands') ||
      lower.startsWith('open history') ||
      lower.startsWith('view history')
    ) {
      return { 
        intent: 'show_history',
        actionPayload: {
          type: 'navigate_tab',
          tab: 'history',
          targetName: 'Command History'
        }
      };
    }

    // 2. Note commands
    if (
      lower === 'show notes' ||
      lower === 'show my notes' ||
      lower === 'view notes' ||
      lower === 'open notes' ||
      lower === 'my notes' ||
      lower.startsWith('show my notes') ||
      lower.startsWith('list all notes')
    ) {
      return { 
        intent: 'view_notes',
        actionPayload: {
          type: 'navigate_tab',
          tab: 'notes',
          targetName: 'Notes Vault'
        }
      };
    }

    const notePrefixes = [
      'save this as a note:',
      'save this as a note',
      'save as note:',
      'save note:',
      'create note:',
      'take note:',
      'note that:',
      'note:'
    ];
    for (const prefix of notePrefixes) {
      if (lower.startsWith(prefix)) {
        const body = cleaned.slice(prefix.length).trim();
        return { intent: 'save_note', metadata: { noteBody: body } };
      }
    }

    // 3. Navigation / Dashboard
    if (
      lower === 'dashboard' ||
      lower === 'go to dashboard' ||
      lower === 'go to my dashboard' ||
      lower === 'open dashboard' ||
      lower === 'show dashboard' ||
      lower === 'home' ||
      lower === 'go home' ||
      lower === 'back to vibe'
    ) {
      return { 
        intent: 'app_navigation',
        actionPayload: {
          type: 'navigate_tab',
          tab: 'command',
          targetName: 'Dashboard'
        }
      };
    }

    // 4. System status / diagnostics
    if (
      lower === 'system status' ||
      lower === 'diagnostics' ||
      lower === 'run diagnostics' ||
      lower === 'telemetry' ||
      lower === 'status report' ||
      lower === 'jaravis status' ||
      lower === 'telemetry status'
    ) {
      return { 
        intent: 'system_status',
        actionPayload: {
          type: 'diagnostic',
          tab: 'intelligence',
          targetName: 'System Intelligence'
        }
      };
    }

    // 5. Weather commands
    const isWeatherQuery =
      lower === 'open weather' ||
      lower === 'show weather' ||
      lower.includes('weather in') ||
      lower.includes('weather today') ||
      lower.includes('weather forecast') ||
      lower.includes('temperature in') ||
      lower.includes('temperature today') ||
      lower.includes('is it raining in') ||
      lower.includes('humidity in') ||
      lower === 'what is the weather' ||
      lower === 'weather' ||
      lower === "what's the weather";
    if (isWeatherQuery) {
      return { intent: 'weather' };
    }

    // 6. Search on Specific Provider (e.g., "search google for java tutorials", "search youtube for react tutorials", "search github for node.js projects")
    const searchPattern1 = /^search\s+([a-zA-Z0-9.\s]+?)\s+for\s+(.+)$/i;
    const searchPattern2 = /^search\s+(?:for\s+)?(.+?)\s+on\s+([a-zA-Z0-9.\s]+)$/i;
    const searchPattern3 = /^(google|youtube|github|reddit|twitter|wikipedia|stackoverflow|linkedin)\s+(?:search\s+)?(?:for\s+)?(.+)$/i;

    let targetMatch: RegisteredTarget | null = null;
    let searchQuery: string | null = null;

    const match1 = cleaned.match(searchPattern1);
    if (match1) {
      const found = findTarget(match1[1].trim());
      if (found && found.searchUrlTemplate) {
        targetMatch = found;
        searchQuery = match1[2].trim();
      }
    }

    if (!targetMatch) {
      const match2 = cleaned.match(searchPattern2);
      if (match2) {
        const found = findTarget(match2[2].trim());
        if (found && found.searchUrlTemplate) {
          targetMatch = found;
          searchQuery = match2[1].trim();
        }
      }
    }

    if (!targetMatch) {
      const match3 = cleaned.match(searchPattern3);
      if (match3) {
        const found = findTarget(match3[1].trim());
        if (found && found.searchUrlTemplate) {
          targetMatch = found;
          searchQuery = match3[2].trim();
        }
      }
    }

    if (targetMatch && searchQuery) {
      const safeUrl = targetMatch.searchUrlTemplate!.replace('{query}', encodeURIComponent(searchQuery));
      if (isAllowedUrl(safeUrl)) {
        return {
          intent: 'web_search',
          target: targetMatch,
          actionPayload: {
            type: 'search_web',
            target: targetMatch.id,
            targetName: targetMatch.name,
            targetCategory: targetMatch.category,
            url: safeUrl,
            query: searchQuery,
            icon: targetMatch.icon,
            color: targetMatch.accentColor,
            desktopSupported: !!targetMatch.desktopProtocol
          },
          customResponse: {
            responseText: `### 🔍 Searching ${targetMatch.name}\n\nQuery: **"${searchQuery}"**\n\n[Launch Search on ${targetMatch.name} ↗](${safeUrl})`,
            speakableText: `Searching ${targetMatch.name} for ${searchQuery}, ${callsign}.`,
            status: 'success'
          }
        };
      }
    }

    // 7. Open Website / Application: "open <target>", "launch <target>", "go to <target>", "take me to <target>", etc.
    const openPattern = /^(?:open|launch|start|navigate to|go to|take me to|visit|bring up|switch to|load|show)\s+([a-zA-Z0-9.\s]+)$/i;
    const openMatch = cleaned.match(openPattern);
    
    let targetToOpen: RegisteredTarget | null = null;
    let rawTargetName = '';

    if (openMatch) {
      rawTargetName = openMatch[1].trim();
      targetToOpen = findTarget(rawTargetName);
    } else {
      const singleTarget = findTarget(cleaned);
      if (singleTarget && (lower === singleTarget.name.toLowerCase() || singleTarget.aliases.includes(lower))) {
        targetToOpen = singleTarget;
        rawTargetName = singleTarget.name;
      }
    }

    if (openMatch || targetToOpen) {
      if (targetToOpen) {
        const targetUrl = targetToOpen.baseUrl;
        if (isAllowedUrl(targetUrl)) {
          return {
            intent: 'open_website',
            target: targetToOpen,
            actionPayload: {
              type: 'open_url',
              target: targetToOpen.id,
              targetName: targetToOpen.name,
              targetCategory: targetToOpen.category,
              url: targetUrl,
              icon: targetToOpen.icon,
              color: targetToOpen.accentColor,
              desktopSupported: !!targetToOpen.desktopProtocol,
              desktopProtocol: targetToOpen.desktopProtocol
            },
            customResponse: {
              responseText: `### 🌐 ${targetToOpen.name} Opened\n\nOpening **${targetToOpen.name}** in a new browser tab.\n\n[Launch ${targetToOpen.name} Directly ↗](${targetUrl})`,
              speakableText: `${targetToOpen.name} opened, ${callsign}.`,
              status: 'success'
            }
          };
        }
      } else if (rawTargetName) {
        return {
          intent: 'unsupported',
          actionPayload: {
            type: 'unsupported',
            targetName: rawTargetName
          },
          customResponse: {
            responseText: `I cannot open "${rawTargetName}" because it is not in the verified allowlist, ${callsign}. You can ask me to open Google, YouTube, WhatsApp, Gmail, GitHub, Google Maps, Google Drive, Google Calendar, LinkedIn, Instagram, Facebook, ChatGPT, and more.`,
            speakableText: `I cannot open that application, ${callsign}.`,
            status: 'unsupported'
          }
        };
      }
    }

    // 8. Math calculation
    const mathPattern = /^(?:calculate|compute|what\s+is)\s+([0-9\s+\-*/%^().]+)$/i;
    if (mathPattern.test(cleaned)) {
      return { intent: 'calculate' };
    }

    // 9. Explicit general web search for current / real-time / latest facts
    const isSearchQuery =
      lower.startsWith('search google for') ||
      lower.startsWith('search web for') ||
      lower.startsWith('search for') ||
      lower.startsWith('google ') ||
      lower.includes('latest news') ||
      lower.includes('current stock price') ||
      lower.includes('today score') ||
      lower.includes('who won yesterday') ||
      lower.includes('live score');
    if (isSearchQuery) {
      return { intent: 'web_search' };
    }

    // 10. General AI reasoning / factual knowledge
    return { intent: 'ai_chat' };
  }

  /**
   * Orchestrate streaming command execution
   */
  public async executeStream(
    rawInput: string,
    userProfile: {
      userId: string;
      displayName: string;
      callsign: string;
      assistantStyle: string;
    },
    callbacks: {
      onIntent?: (intent: StorageCommandIntent, payload?: any) => void;
      onChunk: (chunk: string) => void;
      onSources?: (sources: SearchSource[]) => void;
    },
    selectedModel: string = 'gemini-3.7-flash',
    signal?: AbortSignal
  ): Promise<CommandProcessResult> {
    const startTime = Date.now();
    const cleaned = rawInput.trim();
    const callsign = userProfile.callsign || 'Sir';

    const classification = this.classifyIntent(cleaned, callsign);
    if (callbacks.onIntent) {
      callbacks.onIntent(classification.intent, classification.actionPayload);
    }

    let responseText = '';
    let speakableText = '';
    let searchSources: SearchSource[] | undefined = undefined;
    let createdNote: Note | undefined = undefined;
    let actionPayload: any = classification.actionPayload;
    let status: 'success' | 'error' | 'unsupported' = 'success';

    // If pre-computed custom response exists (e.g. open_website, web_search, unsupported)
    if (classification.customResponse) {
      responseText = classification.customResponse.responseText;
      speakableText = classification.customResponse.speakableText;
      status = classification.customResponse.status || 'success';
      callbacks.onChunk(responseText);
    } else {
      switch (classification.intent) {
        case 'clear_history': {
          storage.clearCommands(userProfile.userId);
          responseText = `All command history records have been cleared, ${callsign}.`;
          speakableText = `Command history cleared, ${callsign}.`;
          callbacks.onChunk(responseText);
          break;
        }

        case 'show_history': {
          responseText = `Opening your Command History logs, ${callsign}.`;
          speakableText = `Opening your command history logs, ${callsign}.`;
          callbacks.onChunk(responseText);
          break;
        }

        case 'view_notes': {
          responseText = `Opening your Notes Vault, ${callsign}.`;
          speakableText = `Opening your Notes Vault, ${callsign}.`;
          callbacks.onChunk(responseText);
          break;
        }

        case 'app_navigation': {
          responseText = `Navigating to Primary Command Deck, ${callsign}.`;
          speakableText = `Navigating to dashboard, ${callsign}.`;
          callbacks.onChunk(responseText);
          break;
        }

        case 'save_note': {
          const noteBody = classification.metadata?.noteBody || cleaned;
          const lines = noteBody.split('\n');
          const firstLine = lines[0].replace(/^#+\s*/, '').trim();
          const title = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine || 'Quick Directive';

          createdNote = storage.addNote({
            id: 'note_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            userId: userProfile.userId,
            title,
            content: noteBody,
            tags: ['JARAVIS', 'Directive'],
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          responseText = `### 📝 Note Recorded to Vault\n\n**${title}**\n\n${noteBody}\n\n*Stored securely in your Notes Vault.*`;
          speakableText = `Note saved to your vault, ${callsign}: ${title}.`;
          actionPayload = {
            type: 'save_note',
            noteId: createdNote.id,
            noteTitle: createdNote.title
          };
          callbacks.onChunk(responseText);
          break;
        }

        case 'system_status': {
          const stats = storage.getStats();
          responseText = `### ⚡ JARAVIS System Diagnostics\n\n- **Intelligence Engine**: Online (Gemini 3.7 Intelligence Array)\n- **Active Operative**: Authenticated (${userProfile.displayName} / ${callsign})\n- **Memory Buffer**: ${stats.memoryUsageMB} MB\n- **System Uptime**: ${Math.floor(stats.uptimeSeconds / 60)} minutes\n- **Commands Processed**: ${stats.totalCommands}\n- **Notes Vault**: ${stats.totalNotes} records\n- **Status**: Peak operational efficiency.`;
          speakableText = `All systems operational, ${callsign}. Core parameters optimal.`;
          callbacks.onChunk(responseText);
          break;
        }

        case 'weather': {
          const location = weatherService.extractLocation(cleaned);
          const weatherRes = await weatherService.getLiveWeather(location, callsign);
          responseText = weatherRes.formattedResponse;
          speakableText = weatherRes.speakableText;
          searchSources = weatherRes.sources;
          callbacks.onChunk(responseText);
          if (searchSources && callbacks.onSources) {
            callbacks.onSources(searchSources);
          }
          break;
        }

        case 'calculate': {
          const history = this.getRecentHistory(userProfile.userId, 4);
          const aiRes = await aiService.generateAnswerStream(
            cleaned,
            callbacks,
            {
              callsign,
              assistantStyle: userProfile.assistantStyle,
              modelName: selectedModel,
              history,
              signal
            }
          );
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }

        case 'web_search': {
          const history = this.getRecentHistory(userProfile.userId, 4);
          const aiRes = await aiService.generateAnswerStream(
            cleaned,
            callbacks,
            {
              callsign,
              assistantStyle: userProfile.assistantStyle,
              modelName: selectedModel,
              enableSearchGrounding: true,
              history,
              signal
            }
          );
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }

        case 'ai_chat':
        default: {
          const history = this.getRecentHistory(userProfile.userId, 6);
          const aiRes = await aiService.generateAnswerStream(
            cleaned,
            callbacks,
            {
              callsign,
              assistantStyle: userProfile.assistantStyle,
              modelName: selectedModel,
              enableSearchGrounding: false,
              history,
              signal
            }
          );
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Log command in storage
    const cmdLog: CommandLog = {
      id: 'cmd_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: userProfile.userId,
      rawInput: cleaned,
      intent: classification.intent,
      status: status === 'unsupported' ? 'error' : 'success',
      responseText,
      speakableText,
      executionTimeMs,
      tokensUsed: Math.floor(cleaned.length / 4) + Math.floor(responseText.length / 4),
      searchSources,
      actionPayload,
      createdAt: new Date().toISOString()
    };

    storage.addCommand(cmdLog);

    return {
      intent: classification.intent,
      status,
      responseText,
      speakableText,
      searchSources,
      createdNote,
      actionPayload,
      executionTimeMs
    };
  }

  /**
   * Orchestrate full non-streaming command execution
   */
  public async execute(
    rawInput: string,
    userProfile: {
      userId: string;
      displayName: string;
      callsign: string;
      assistantStyle: string;
    },
    selectedModel: string = 'gemini-3.7-flash'
  ): Promise<CommandProcessResult> {
    const startTime = Date.now();
    const cleaned = rawInput.trim();
    const callsign = userProfile.callsign || 'Sir';

    const classification = this.classifyIntent(cleaned, callsign);
    let responseText = '';
    let speakableText = '';
    let searchSources: SearchSource[] | undefined = undefined;
    let createdNote: Note | undefined = undefined;
    let actionPayload: any = classification.actionPayload;
    let status: 'success' | 'error' | 'unsupported' = 'success';

    if (classification.customResponse) {
      responseText = classification.customResponse.responseText;
      speakableText = classification.customResponse.speakableText;
      status = classification.customResponse.status || 'success';
    } else {
      switch (classification.intent) {
        case 'clear_history': {
          storage.clearCommands(userProfile.userId);
          responseText = `All command history records have been cleared, ${callsign}.`;
          speakableText = `Command history cleared, ${callsign}.`;
          break;
        }

        case 'show_history': {
          responseText = `Opening your Command History logs, ${callsign}.`;
          speakableText = `Opening your command history logs, ${callsign}.`;
          break;
        }

        case 'view_notes': {
          responseText = `Opening your Notes Vault, ${callsign}.`;
          speakableText = `Opening your Notes Vault, ${callsign}.`;
          break;
        }

        case 'app_navigation': {
          responseText = `Navigating to Primary Command Deck, ${callsign}.`;
          speakableText = `Navigating to dashboard, ${callsign}.`;
          break;
        }

        case 'save_note': {
          const noteBody = classification.metadata?.noteBody || cleaned;
          const lines = noteBody.split('\n');
          const firstLine = lines[0].replace(/^#+\s*/, '').trim();
          const title = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine || 'Quick Directive';

          createdNote = storage.addNote({
            id: 'note_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            userId: userProfile.userId,
            title,
            content: noteBody,
            tags: ['JARAVIS', 'Directive'],
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          responseText = `### 📝 Note Recorded to Vault\n\n**${title}**\n\n${noteBody}\n\n*Stored securely in your Notes Vault.*`;
          speakableText = `Note saved to your vault, ${callsign}: ${title}.`;
          actionPayload = {
            type: 'save_note',
            noteId: createdNote.id,
            noteTitle: createdNote.title
          };
          break;
        }

        case 'system_status': {
          const stats = storage.getStats();
          responseText = `### ⚡ JARAVIS System Diagnostics\n\n- **Intelligence Engine**: Online (Gemini 3.7 Intelligence Array)\n- **Active Operative**: Authenticated (${userProfile.displayName} / ${callsign})\n- **Memory Buffer**: ${stats.memoryUsageMB} MB\n- **System Uptime**: ${Math.floor(stats.uptimeSeconds / 60)} minutes\n- **Commands Processed**: ${stats.totalCommands}\n- **Notes Vault**: ${stats.totalNotes} records\n- **Status**: Peak operational efficiency.`;
          speakableText = `All systems operational, ${callsign}. Core parameters optimal.`;
          break;
        }

        case 'weather': {
          const location = weatherService.extractLocation(cleaned);
          const weatherRes = await weatherService.getLiveWeather(location, callsign);
          responseText = weatherRes.formattedResponse;
          speakableText = weatherRes.speakableText;
          searchSources = weatherRes.sources;
          break;
        }

        case 'calculate': {
          const history = this.getRecentHistory(userProfile.userId, 4);
          const aiRes = await aiService.generateAnswer(cleaned, {
            callsign,
            assistantStyle: userProfile.assistantStyle,
            modelName: selectedModel,
            history
          });
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }

        case 'web_search': {
          const history = this.getRecentHistory(userProfile.userId, 4);
          const aiRes = await aiService.generateAnswer(cleaned, {
            callsign,
            assistantStyle: userProfile.assistantStyle,
            modelName: selectedModel,
            enableSearchGrounding: true,
            history
          });
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }

        case 'ai_chat':
        default: {
          const history = this.getRecentHistory(userProfile.userId, 6);
          const aiRes = await aiService.generateAnswer(cleaned, {
            callsign,
            assistantStyle: userProfile.assistantStyle,
            modelName: selectedModel,
            enableSearchGrounding: false,
            history
          });
          responseText = aiRes.responseText;
          speakableText = aiRes.speakableText;
          searchSources = aiRes.sources;
          break;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Log command in storage
    const cmdLog: CommandLog = {
      id: 'cmd_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: userProfile.userId,
      rawInput: cleaned,
      intent: classification.intent,
      status: status === 'unsupported' ? 'error' : 'success',
      responseText,
      speakableText,
      executionTimeMs,
      tokensUsed: Math.floor(cleaned.length / 4) + Math.floor(responseText.length / 4),
      searchSources,
      actionPayload,
      createdAt: new Date().toISOString()
    };

    storage.addCommand(cmdLog);

    return {
      intent: classification.intent,
      status,
      responseText,
      speakableText,
      searchSources,
      createdNote,
      actionPayload,
      executionTimeMs
    };
  }
}

export const commandService = new CommandService();


