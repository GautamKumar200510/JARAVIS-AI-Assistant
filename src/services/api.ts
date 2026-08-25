import { User, CommandLog, Note, TelemetryData, SearchSource, CommandIntent } from '../types';

const TOKEN_KEY = 'jaravis_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export interface StreamEvents {
  onStart?: (data: { rawInput: string; model: string; callsign: string }) => void;
  onIntent?: (data: { intent: CommandIntent; actionPayload?: any }) => void;
  onChunk?: (data: { delta: string; textSoFar: string }) => void;
  onSources?: (data: { sources: SearchSource[] }) => void;
  onDone?: (data: {
    command: CommandLog;
    createdNote?: Note;
    intent: CommandIntent;
    responseText: string;
    speakableText: string;
    searchSources?: SearchSource[];
    actionPayload?: any;
    executionTimeMs: number;
  }) => void;
  onError?: (error: Error) => void;
}

export const api = {
  // Auth
  auth: {
    me: () => request<{ user: User }>('/api/auth/me'),
    login: (identifier: string, password: string) =>
      request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    register: (data: { username: string; email: string; password: string; displayName?: string; callsign?: string }) =>
      request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    demoLogin: () =>
      request<{ user: User; token: string }>('/api/auth/demo-login', {
        method: 'POST'
      }),
    simpleLogin: (name: string, email: string, callsign?: string) =>
      request<{ user: User; token: string }>('/api/auth/simple-login', {
        method: 'POST',
        body: JSON.stringify({ name, email, callsign })
      }),
    updateProfile: (data: Partial<User>) =>
      request<{ user: User }>('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Chat conversation
  chat: {
    clear: () =>
      request<{ success: boolean; message: string; clearedCount: number }>('/api/chat/clear', {
        method: 'DELETE'
      })
  },

  // Commands & Assistant Execution
  commands: {
    streamExecute: async (
      command: string,
      events: StreamEvents,
      options?: { model?: string; signal?: AbortSignal }
    ) => {
      const token = getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      };
      if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/commands/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({ command, model: options?.model }),
        signal: options?.signal
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const err = new Error(errJson.error || `HTTP error ${response.status}`);
        events.onError?.(err);
        throw err;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const block of lines) {
            if (!block.trim()) continue;
            const blockLines = block.split('\n');
            let eventType = 'message';
            let eventData = '';

            for (const line of blockLines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.slice(6);
              }
            }

            if (eventData) {
              try {
                const parsed = JSON.parse(eventData);
                if (eventType === 'start') {
                  events.onStart?.(parsed);
                } else if (eventType === 'intent') {
                  events.onIntent?.(parsed);
                } else if (eventType === 'chunk') {
                  events.onChunk?.(parsed);
                } else if (eventType === 'sources') {
                  events.onSources?.(parsed);
                } else if (eventType === 'done') {
                  events.onDone?.(parsed);
                } else if (eventType === 'error') {
                  events.onError?.(new Error(parsed.error || 'Server stream error'));
                }
              } catch (e) {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          events.onError?.(err);
          throw err;
        }
      }
    },
    execute: (command: string, model?: string) =>
      request<{
        command: CommandLog;
        createdNote?: Note;
        intent: CommandIntent;
        responseText: string;
        speakableText: string;
        searchSources?: SearchSource[];
      }>('/api/commands/execute', {
        method: 'POST',
        body: JSON.stringify({ command, model })
      }),
    getHistory: (params?: { intent?: string; query?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.intent) searchParams.set('intent', params.intent);
      if (params?.query) searchParams.set('query', params.query);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const qs = searchParams.toString();
      return request<{ commands: CommandLog[] }>(`/api/commands/history${qs ? `?${qs}` : ''}`);
    },
    deleteItem: (id: string) =>
      request<{ success: boolean }>(`/api/commands/history/${id}`, {
        method: 'DELETE'
      }),
    clearAll: () =>
      request<{ success: boolean; count: number }>('/api/commands/history', {
        method: 'DELETE'
      })
  },

  // Direct assistant command alias
  assistant: {
    streamCommand: (command: string, events: StreamEvents, options?: { model?: string; signal?: AbortSignal }) =>
      api.commands.streamExecute(command, events, options),
    command: (command: string, model?: string) =>
      request<{
        command: CommandLog;
        createdNote?: Note;
        intent: CommandIntent;
        responseText: string;
        speakableText: string;
        searchSources?: SearchSource[];
      }>('/api/assistant/command', {
        method: 'POST',
        body: JSON.stringify({ command, model })
      })
  },

  // Notes
  notes: {
    getAll: (params?: { tag?: string; query?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tag) searchParams.set('tag', params.tag);
      if (params?.query) searchParams.set('query', params.query);
      const qs = searchParams.toString();
      return request<{ notes: Note[] }>(`/api/notes${qs ? `?${qs}` : ''}`);
    },
    create: (data: { title: string; content: string; tags?: string[]; pinned?: boolean; color?: string }) =>
      request<{ note: Note }>('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<Note>) =>
      request<{ note: Note }>(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    togglePin: (id: string) =>
      request<{ note: Note }>(`/api/notes/${id}/pin`, {
        method: 'PATCH'
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/notes/${id}`, {
        method: 'DELETE'
      })
  },

  // System & Quick tools
  system: {
    getTelemetry: () => request<TelemetryData>('/api/system/telemetry'),
    search: (query: string) =>
      request<{ query: string; responseText: string; speakableText: string; searchSources: SearchSource[] }>(
        '/api/system/search',
        {
          method: 'POST',
          body: JSON.stringify({ query })
        }
      ),
    getWeather: (city: string) =>
      request<{ city: string; weatherReport: string; speakableText: string; searchSources: SearchSource[] }>(
        `/api/system/weather?city=${encodeURIComponent(city)}`
      )
  }
};
