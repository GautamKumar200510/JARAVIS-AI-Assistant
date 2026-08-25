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
    description: 'Search the web and locate real-time information.'
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
    description: 'Watch video tutorials, music, and streams.'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    aliases: ['whatsapp', 'wa', 'whats app', 'whatsapp web'],
    category: 'social',
    baseUrl: 'https://web.whatsapp.com',
    desktopProtocol: 'whatsapp://',
    icon: 'MessageSquare',
    accentColor: '#25D366',
    description: 'Direct encrypted messaging and communication client.'
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
    description: 'Access tactical communications and email inbox.'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    aliases: ['github', 'git hub', 'gh', 'repositories'],
    category: 'developer',
    baseUrl: 'https://github.com',
    searchUrlTemplate: 'https://github.com/search?q={query}',
    icon: 'Github',
    accentColor: '#FFFFFF',
    description: 'Source code repositories and open-source projects.'
  },
  maps: {
    id: 'maps',
    name: 'Google Maps',
    aliases: ['maps', 'google maps', 'map', 'navigation', 'directions'],
    category: 'utility',
    baseUrl: 'https://maps.google.com',
    searchUrlTemplate: 'https://www.google.com/maps/search/{query}',
    icon: 'MapPin',
    accentColor: '#34A853',
    description: 'Geospatial mapping and satellite telemetry.'
  },
  drive: {
    id: 'drive',
    name: 'Google Drive',
    aliases: ['drive', 'google drive', 'gdrive', 'docs'],
    category: 'productivity',
    baseUrl: 'https://drive.google.com',
    searchUrlTemplate: 'https://drive.google.com/drive/search?q={query}',
    icon: 'HardDrive',
    accentColor: '#F4B400',
    description: 'Cloud document storage and collaborative spreadsheets.'
  },
  calendar: {
    id: 'calendar',
    name: 'Google Calendar',
    aliases: ['calendar', 'google calendar', 'gcal', 'schedule', 'agenda'],
    category: 'productivity',
    baseUrl: 'https://calendar.google.com',
    icon: 'Calendar',
    accentColor: '#4285F4',
    description: 'Schedules, timeline events, and synchronized agendas.'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    aliases: ['linkedin', 'linked in', 'li'],
    category: 'social',
    baseUrl: 'https://www.linkedin.com',
    searchUrlTemplate: 'https://www.linkedin.com/search/results/all/?keywords={query}',
    icon: 'Briefcase',
    accentColor: '#0A66C2',
    description: 'Professional network and industry intelligence.'
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
    description: 'Visual media streams and reels.'
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
    description: 'Social networking platform and feeds.'
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    aliases: ['chatgpt', 'chat gpt', 'openai'],
    category: 'ai',
    baseUrl: 'https://chatgpt.com',
    icon: 'Bot',
    accentColor: '#10A37F',
    description: 'OpenAI conversational intelligence interface.'
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    aliases: ['twitter', 'x', 'x com'],
    category: 'social',
    baseUrl: 'https://x.com',
    searchUrlTemplate: 'https://x.com/search?q={query}',
    icon: 'Twitter',
    accentColor: '#1DA1F2',
    description: 'Real-time global social feed.'
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
    description: 'Community discussion forums.'
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    aliases: ['wikipedia', 'wiki'],
    category: 'utility',
    baseUrl: 'https://www.wikipedia.org',
    searchUrlTemplate: 'https://en.wikipedia.org/wiki/Special:Search?search={query}',
    icon: 'BookOpen',
    accentColor: '#FFFFFF',
    description: 'Global collaborative encyclopedia.'
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify', 'music', 'songs'],
    category: 'media',
    baseUrl: 'https://open.spotify.com',
    desktopProtocol: 'spotify://',
    icon: 'Music',
    accentColor: '#1DB954',
    description: 'Audio streaming and playlists.'
  },
  stackoverflow: {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    aliases: ['stackoverflow', 'stack overflow', 'so'],
    category: 'developer',
    baseUrl: 'https://stackoverflow.com',
    searchUrlTemplate: 'https://stackoverflow.com/search?q={query}',
    icon: 'Code',
    accentColor: '#F48024',
    description: 'Developer programming Q&A knowledge base.'
  }
};

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
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

export function findTarget(query: string): RegisteredTarget | null {
  const normalized = query.toLowerCase().trim();
  if (SUPPORTED_TARGETS[normalized]) return SUPPORTED_TARGETS[normalized];

  for (const target of Object.values(SUPPORTED_TARGETS)) {
    if (target.aliases.some(alias => alias === normalized || normalized.includes(alias))) {
      return target;
    }
  }
  return null;
}

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
