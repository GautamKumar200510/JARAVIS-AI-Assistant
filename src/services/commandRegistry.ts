import { RegisteredTarget, RegisteredCommand, CommandIntent, ActionPayload } from '../types';

/**
 * Centrally registered targets with strict safe URL allowlist, aliases, icons, and search templates.
 */
export const SUPPORTED_TARGETS: Record<string, RegisteredTarget> = {
  google: {
    id: 'google',
    name: 'Google',
    aliases: ['google', 'google search', 'google com', 'search google'],
    category: 'productivity',
    baseUrl: 'https://www.google.com',
    searchUrlTemplate: 'https://www.google.com/search?q={query}',
    icon: 'Search',
    accentColor: '#4285F4',
    description: 'Search the web, browse articles, and locate real-time information.'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    aliases: ['youtube', 'yt', 'you tube', 'youtube com', 'videos'],
    category: 'media',
    baseUrl: 'https://www.youtube.com',
    searchUrlTemplate: 'https://www.youtube.com/results?search_query={query}',
    icon: 'Youtube',
    accentColor: '#FF0000',
    description: 'Watch video tutorials, music, podcasts, and livestreams.'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    aliases: ['whatsapp', 'wa', 'whats app', 'whatsapp web', 'web whatsapp', 'whatsappweb', 'whatsapp message'],
    category: 'social',
    baseUrl: 'https://web.whatsapp.com',
    desktopProtocol: 'whatsapp://',
    icon: 'MessageSquare',
    accentColor: '#25D366',
    description: 'Direct encrypted messaging, status, and communication client.'
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    aliases: ['gmail', 'google mail', 'email', 'inbox', 'my mail'],
    category: 'productivity',
    baseUrl: 'https://mail.google.com',
    searchUrlTemplate: 'https://mail.google.com/mail/u/0/#search/{query}',
    icon: 'Mail',
    accentColor: '#EA4335',
    description: 'Access communications, tactical dispatches, and incoming emails.'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    aliases: ['github', 'git hub', 'gh', 'github repo', 'github repository', 'repositories'],
    category: 'developer',
    baseUrl: 'https://github.com',
    searchUrlTemplate: 'https://github.com/search?q={query}',
    icon: 'Github',
    accentColor: '#FFFFFF',
    description: 'Source code repositories, pull requests, open-source projects, and issues.'
  },
  maps: {
    id: 'maps',
    name: 'Google Maps',
    aliases: ['maps', 'google maps', 'map', 'navigation', 'gps', 'directions', 'location'],
    category: 'utility',
    baseUrl: 'https://maps.google.com',
    searchUrlTemplate: 'https://www.google.com/maps/search/{query}',
    icon: 'MapPin',
    accentColor: '#34A853',
    description: 'Geospatial mapping, driving directions, satellite telemetry, and traffic.'
  },
  drive: {
    id: 'drive',
    name: 'Google Drive',
    aliases: ['drive', 'google drive', 'gdrive', 'docs', 'cloud storage'],
    category: 'productivity',
    baseUrl: 'https://drive.google.com',
    searchUrlTemplate: 'https://drive.google.com/drive/search?q={query}',
    icon: 'HardDrive',
    accentColor: '#F4B400',
    description: 'Cloud document storage, collaborative spreadsheets, and tactical files.'
  },
  calendar: {
    id: 'calendar',
    name: 'Google Calendar',
    aliases: ['calendar', 'google calendar', 'gcal', 'schedule', 'agenda', 'appointments'],
    category: 'productivity',
    baseUrl: 'https://calendar.google.com',
    icon: 'Calendar',
    accentColor: '#4285F4',
    description: 'Schedules, tactical timeline events, reminders, and synchronized agendas.'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    aliases: ['linkedin', 'linked in', 'li', 'networking'],
    category: 'social',
    baseUrl: 'https://www.linkedin.com',
    searchUrlTemplate: 'https://www.linkedin.com/search/results/all/?keywords={query}',
    icon: 'Briefcase',
    accentColor: '#0A66C2',
    description: 'Professional network, industry intelligence, job listings, and contacts.'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    aliases: ['instagram', 'insta', 'ig'],
    category: 'social',
    baseUrl: 'https://www.instagram.com',
    searchUrlTemplate: 'https://www.instagram.com/explore/tags/{query}',
    icon: 'Instagram',
    accentColor: '#E4405F',
    description: 'Visual media streams, stories, reels, and social updates.'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    aliases: ['facebook', 'fb'],
    category: 'social',
    baseUrl: 'https://www.facebook.com',
    searchUrlTemplate: 'https://www.facebook.com/search/top?q={query}',
    icon: 'Share2',
    accentColor: '#1877F2',
    description: 'Social networking platform, groups, feeds, and community pages.'
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    aliases: ['chatgpt', 'chat gpt', 'openai', 'gpt'],
    category: 'ai',
    baseUrl: 'https://chatgpt.com',
    icon: 'Bot',
    accentColor: '#10A37F',
    description: 'OpenAI conversational interface for secondary LLM reference.'
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    aliases: ['twitter', 'x', 'x com', 'tweets'],
    category: 'social',
    baseUrl: 'https://x.com',
    searchUrlTemplate: 'https://x.com/search?q={query}',
    icon: 'Twitter',
    accentColor: '#1DA1F2',
    description: 'Real-time global social feed and breaking dispatches.'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    aliases: ['reddit', 'subreddits', 'r/'],
    category: 'social',
    baseUrl: 'https://www.reddit.com',
    searchUrlTemplate: 'https://www.reddit.com/search/?q={query}',
    icon: 'MessageCircle',
    accentColor: '#FF4500',
    description: 'Community forums, discussions, developer threads, and news.'
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    aliases: ['wikipedia', 'wiki', 'encyclopedia'],
    category: 'utility',
    baseUrl: 'https://www.wikipedia.org',
    searchUrlTemplate: 'https://en.wikipedia.org/wiki/Special:Search?search={query}',
    icon: 'BookOpen',
    accentColor: '#FFFFFF',
    description: 'Global collaborative encyclopedia and reference knowledge repository.'
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify', 'music', 'songs', 'playlist'],
    category: 'media',
    baseUrl: 'https://open.spotify.com',
    desktopProtocol: 'spotify://',
    icon: 'Music',
    accentColor: '#1DB954',
    description: 'Audio streaming, music albums, playlists, and podcasts.'
  },
  stackoverflow: {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    aliases: ['stackoverflow', 'stack overflow', 'so', 'stack exchange'],
    category: 'developer',
    baseUrl: 'https://stackoverflow.com',
    searchUrlTemplate: 'https://stackoverflow.com/search?q={query}',
    icon: 'Code',
    accentColor: '#F48024',
    description: 'Software development Q&A and programming knowledge base.'
  }
};

/**
 * Strict Safe Allowlist Validator for Target URLs
 */
export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    
    // Approved allowed hosts
    const approvedDomains = [
      'google.com',
      'www.google.com',
      'mail.google.com',
      'maps.google.com',
      'drive.google.com',
      'calendar.google.com',
      'youtube.com',
      'www.youtube.com',
      'whatsapp.com',
      'web.whatsapp.com',
      'github.com',
      'www.github.com',
      'linkedin.com',
      'www.linkedin.com',
      'instagram.com',
      'www.instagram.com',
      'facebook.com',
      'www.facebook.com',
      'chatgpt.com',
      'openai.com',
      'x.com',
      'twitter.com',
      'reddit.com',
      'www.reddit.com',
      'wikipedia.org',
      'en.wikipedia.org',
      'spotify.com',
      'open.spotify.com',
      'stackoverflow.com',
      'weather.com'
    ];

    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      approvedDomains.some(d => host === d || host.endsWith('.' + d))
    );
  } catch {
    return false;
  }
}

/**
 * Find matching registered target by name or alias
 */
export function findTarget(query: string): RegisteredTarget | null {
  const normalized = query.toLowerCase().trim();
  
  // Exact ID check
  if (SUPPORTED_TARGETS[normalized]) {
    return SUPPORTED_TARGETS[normalized];
  }

  // Aliases check
  for (const target of Object.values(SUPPORTED_TARGETS)) {
    if (target.aliases.some(alias => alias === normalized || normalized.includes(alias))) {
      return target;
    }
  }

  return null;
}

export interface ParsedCommandIntent {
  intent: CommandIntent;
  target?: RegisteredTarget;
  actionPayload?: ActionPayload;
  speakableText: string;
  responseText: string;
  status: 'success' | 'error' | 'unsupported';
}

/**
 * Clean prefix strings like "jaravis", "jarvis", "hey jarvis", "please", "can you"
 */
export function cleanVoicePrefix(raw: string): string {
  let text = raw.trim();
  const prefixes = [
    /^(?:hey|hi|hello|ok|okay)?\s*(?:jaravis|jarvis|gemini|assistant)[,\s:]*/i,
    /^(?:please|can you|could you|would you|kindly|i want to|i want you to)\s*/i,
    /^(?:hey|hi|hello)[,\s:]*/i
  ];

  let matched = true;
  while (matched) {
    matched = false;
    for (const rx of prefixes) {
      if (rx.test(text)) {
        text = text.replace(rx, '').trim();
        matched = true;
      }
    }
  }

  return text;
}

/**
 * Primary Natural Language Command Matcher & Classifier
 */
export function matchCommandIntent(rawInput: string, callsign: string = 'Sir'): ParsedCommandIntent {
  const cleaned = cleanVoicePrefix(rawInput);
  const lower = cleaned.toLowerCase().trim();

  // 1. In-App Navigation Directives
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
        targetName: 'Dashboard',
        icon: 'LayoutDashboard',
        openedSuccessfully: true
      },
      responseText: `Navigating to JARAVIS Primary Command Deck, ${callsign}.`,
      speakableText: `Navigating to dashboard, ${callsign}.`,
      status: 'success'
    };
  }

  if (
    lower === 'show notes' ||
    lower === 'show my notes' ||
    lower === 'open notes' ||
    lower === 'view notes' ||
    lower === 'my notes' ||
    lower === 'notes vault' ||
    lower.startsWith('open my notes') ||
    lower.startsWith('list all notes')
  ) {
    return {
      intent: 'view_notes',
      actionPayload: {
        type: 'navigate_tab',
        tab: 'notes',
        targetName: 'Notes Vault',
        icon: 'FileText',
        openedSuccessfully: true
      },
      responseText: `Opening encrypted Notes Vault. All indexed documents, algorithms, and directives are loaded, ${callsign}.`,
      speakableText: `Opening Notes Vault, ${callsign}.`,
      status: 'success'
    };
  }

  if (
    lower === 'show history' ||
    lower === 'show my command history' ||
    lower === 'show command history' ||
    lower === 'open history' ||
    lower === 'view history' ||
    lower === 'command history' ||
    lower === 'activity logs'
  ) {
    return {
      intent: 'show_history',
      actionPayload: {
        type: 'navigate_tab',
        tab: 'history',
        targetName: 'Command History',
        icon: 'History',
        openedSuccessfully: true
      },
      responseText: `Accessing telemetry archives. Your past execution dispatches and command logs are ready, ${callsign}.`,
      speakableText: `Opening your command history, ${callsign}.`,
      status: 'success'
    };
  }

  if (
    lower === 'system status' ||
    lower === 'diagnostics' ||
    lower === 'run diagnostics' ||
    lower === 'telemetry' ||
    lower === 'status report' ||
    lower === 'jaravis status'
  ) {
    return {
      intent: 'system_status',
      actionPayload: {
        type: 'diagnostic',
        tab: 'intelligence',
        targetName: 'System Intelligence',
        icon: 'Cpu',
        openedSuccessfully: true
      },
      responseText: `Running complete system diagnostics on all cores, neural arrays, and memory buffers, ${callsign}.`,
      speakableText: `System diagnostics initialized, ${callsign}.`,
      status: 'success'
    };
  }

  // 2. Weather Directives
  if (
    lower === 'open weather' ||
    lower === 'show weather' ||
    lower === 'check weather' ||
    lower === 'weather forecast' ||
    lower.startsWith('what is the weather') ||
    lower.startsWith('weather in ') ||
    lower.includes('temperature in')
  ) {
    return {
      intent: 'weather',
      actionPayload: {
        type: 'open_url',
        target: 'weather',
        targetName: 'Live Weather',
        icon: 'CloudSun'
      },
      responseText: `Accessing atmospheric sensors and live meteorological telemetry, ${callsign}.`,
      speakableText: `Retrieving live weather parameters, ${callsign}.`,
      status: 'success'
    };
  }

  // 3. Search on Specific Target Provider: "search <target> for <query>", "search <query> on <target>"
  // Examples: "search google for java tutorials", "search youtube for react tutorials", "search github for node.js projects"
  const searchPattern1 = /^search\s+([a-zA-Z0-9.\s]+?)\s+for\s+(.+)$/i;
  const searchPattern2 = /^search\s+(?:for\s+)?(.+?)\s+on\s+([a-zA-Z0-9.\s]+)$/i;
  const searchPattern3 = /^(google|youtube|github|reddit|twitter|wikipedia|stackoverflow|linkedin)\s+(?:search\s+)?(?:for\s+)?(.+)$/i;

  let targetMatch: RegisteredTarget | null = null;
  let searchQuery: string | null = null;

  const match1 = cleaned.match(searchPattern1);
  if (match1) {
    const rawTarget = match1[1].trim();
    const candidateQuery = match1[2].trim();
    const found = findTarget(rawTarget);
    if (found && found.searchUrlTemplate) {
      targetMatch = found;
      searchQuery = candidateQuery;
    }
  }

  if (!targetMatch) {
    const match2 = cleaned.match(searchPattern2);
    if (match2) {
      const candidateQuery = match2[1].trim();
      const rawTarget = match2[2].trim();
      const found = findTarget(rawTarget);
      if (found && found.searchUrlTemplate) {
        targetMatch = found;
        searchQuery = candidateQuery;
      }
    }
  }

  if (!targetMatch) {
    const match3 = cleaned.match(searchPattern3);
    if (match3) {
      const rawTarget = match3[1].trim();
      const candidateQuery = match3[2].trim();
      const found = findTarget(rawTarget);
      if (found && found.searchUrlTemplate) {
        targetMatch = found;
        searchQuery = candidateQuery;
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
          desktopSupported: !!targetMatch.desktopProtocol,
          openedSuccessfully: true
        },
        responseText: `### 🔍 Searching ${targetMatch.name}\n\nQuery: **"${searchQuery}"**\n\n[Launch Search on ${targetMatch.name} ↗](${safeUrl})\n\n*Opening search query viewport for ${callsign}.*`,
        speakableText: `Searching ${targetMatch.name} for ${searchQuery}, ${callsign}.`,
        status: 'success'
      };
    }
  }

  // 4. Open Website / Application: "open <target>", "launch <target>", "go to <target>", "take me to <target>", etc.
  // Examples: "open google", "open youtube", "open whatsapp", "open gmail", "open github", "open maps"
  const openPattern = /^(?:open|launch|start|navigate to|go to|take me to|visit|bring up|switch to|load|show)\s+([a-zA-Z0-9.\s]+)$/i;
  const openMatch = cleaned.match(openPattern);
  
  let targetToOpen: RegisteredTarget | null = null;
  let rawTargetName = '';

  if (openMatch) {
    rawTargetName = openMatch[1].trim();
    targetToOpen = findTarget(rawTargetName);
  } else {
    // If the input is simply the single target name itself (e.g. "youtube", "whatsapp", "chatgpt")
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
            desktopProtocol: targetToOpen.desktopProtocol,
            openedSuccessfully: true
          },
          responseText: `### 🌐 ${targetToOpen.name} Opened\n\nOpening **${targetToOpen.name}** in a new browser tab.\n\n[Launch ${targetToOpen.name} Directly ↗](${targetUrl})`,
          speakableText: `${targetToOpen.name} opened, ${callsign}.`,
          status: 'success'
        };
      }
    } else if (rawTargetName) {
      // User asked to open something not registered/allowlisted
      return {
        intent: 'unsupported',
        actionPayload: {
          type: 'unsupported',
          targetName: rawTargetName,
          openedSuccessfully: false
        },
        responseText: `I cannot open "${rawTargetName}" because it is not in the verified allowlist, ${callsign}. You can ask me to open Google, YouTube, WhatsApp, Gmail, GitHub, Google Maps, Google Drive, Google Calendar, LinkedIn, Instagram, Facebook, ChatGPT, and more.`,
        speakableText: `I cannot open that application, ${callsign}.`,
        status: 'unsupported'
      };
    }
  }

  // 5. General Web Search Fallback: "search web for <query>", "search for <query>", "search <query>"
  if (lower.startsWith('search web for ') || lower.startsWith('search for ') || lower.startsWith('google ')) {
    const query = cleaned
      .replace(/^(?:search web for|search for|google)\s+/i, '')
      .trim();
    if (query) {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      return {
        intent: 'web_search',
        target: SUPPORTED_TARGETS.google,
        actionPayload: {
          type: 'search_web',
          target: 'google',
          targetName: 'Google Search',
          targetCategory: 'productivity',
          url: googleSearchUrl,
          query,
          icon: 'Search',
          color: '#4285F4',
          openedSuccessfully: true
        },
        responseText: `### 🔍 Searching the Web\n\nQuery: **"${query}"**\n\n[Open Search on Google ↗](${googleSearchUrl})\n\n*Processing grounded search telemetry.*`,
        speakableText: `Searching the web for ${query}, ${callsign}.`,
        status: 'success'
      };
    }
  }

  // 6. Note recording
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
      return {
        intent: 'save_note',
        actionPayload: {
          type: 'save_note',
          noteTitle: body.split('\n')[0].slice(0, 40)
        },
        responseText: `Note recorded to vault, ${callsign}.`,
        speakableText: `Note saved to your vault, ${callsign}.`,
        status: 'success'
      };
    }
  }

  // Default: Fall through to server-side AI reasoning
  return {
    intent: 'ai_chat',
    responseText: '',
    speakableText: '',
    status: 'success'
  };
}

/**
 * List of sample commands & quick suggestions
 */
export const POPULAR_COMMAND_EXAMPLES: RegisteredCommand[] = [
  {
    id: 'open_youtube',
    name: 'Open YouTube',
    intent: 'open_website',
    description: 'Launch YouTube in a new tab',
    examples: ['Jaravis, open YouTube', 'Launch YouTube', 'Open YouTube'],
    category: 'web'
  },
  {
    id: 'open_whatsapp',
    name: 'Open WhatsApp',
    intent: 'open_website',
    description: 'Open WhatsApp Web communication client',
    examples: ['Open WhatsApp', 'Open WhatsApp Web', 'Jaravis, open WhatsApp'],
    category: 'web'
  },
  {
    id: 'search_google',
    name: 'Search Google',
    intent: 'web_search',
    description: 'Search Google for any topic or question',
    examples: ['Search Google for Java tutorials', 'Google latest AI models', 'Search Google for web dev'],
    category: 'search'
  },
  {
    id: 'search_github',
    name: 'Search GitHub',
    intent: 'web_search',
    description: 'Search GitHub repositories and code',
    examples: ['Search GitHub for Node.js projects', 'Search GitHub for React components'],
    category: 'search'
  },
  {
    id: 'search_youtube',
    name: 'Search YouTube',
    intent: 'web_search',
    description: 'Search YouTube video tutorials and music',
    examples: ['Search YouTube for React tutorials', 'Search YouTube for space documentaries'],
    category: 'search'
  },
  {
    id: 'open_gmail',
    name: 'Open Gmail',
    intent: 'open_website',
    description: 'Access incoming dispatches and email inbox',
    examples: ['Open Gmail', 'Launch Gmail', 'Open my email'],
    category: 'web'
  },
  {
    id: 'open_maps',
    name: 'Open Google Maps',
    intent: 'open_website',
    description: 'Geospatial navigation and satellite maps',
    examples: ['Open Google Maps', 'Search Maps for coffee near me'],
    category: 'web'
  },
  {
    id: 'open_weather',
    name: 'Check Weather',
    intent: 'weather',
    description: 'Get live meteorological report and temperature',
    examples: ['Open Weather', 'What is the weather in Tokyo?', 'Current temperature in Delhi'],
    category: 'system'
  },
  {
    id: 'view_notes',
    name: 'Show Notes',
    intent: 'view_notes',
    description: 'Open encrypted notes vault',
    examples: ['Show my notes', 'Open Notes Vault', 'Save note: Review architecture tomorrow'],
    category: 'notes'
  },
  {
    id: 'show_history',
    name: 'Command History',
    intent: 'show_history',
    description: 'View command telemetry and search history',
    examples: ['Show my command history', 'Open history', 'Flush logs'],
    category: 'system'
  },
  {
    id: 'dashboard',
    name: 'Go to Dashboard',
    intent: 'app_navigation',
    description: 'Navigate to JARAVIS central deck',
    examples: ['Go to my dashboard', 'Home', 'Back to vibe'],
    category: 'system'
  }
];
