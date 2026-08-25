import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  callsign: string; // e.g. "Sir", "Commander", "Doctor", "Boss"
  themeColor: 'cyan' | 'amber' | 'emerald' | 'violet' | 'crimson';
  voiceSettings: {
    pitch: number;
    rate: number;
    voiceName?: string;
    autoSpeak: boolean;
    soundEffects: boolean;
  };
  assistantStyle: 'butler' | 'technical' | 'concise' | 'creative';
  createdAt: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export type StorageCommandIntent =
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

export interface CommandLog {
  id: string;
  userId: string;
  rawInput: string;
  intent: StorageCommandIntent;
  status: 'success' | 'error' | 'processing';
  responseText: string;
  speakableText: string;
  executionTimeMs: number;
  tokensUsed?: number;
  searchSources?: SearchSource[];
  actionPayload?: any;
  createdAt: string;
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

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  timeStr: string;
  completed: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  commands: CommandLog[];
  notes: Note[];
  reminders: Reminder[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'jaravis_db.json');

class StorageManager {
  private data: DatabaseSchema = {
    users: [],
    commands: [],
    notes: [],
    reminders: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedDefaultData();
        this.save();
      }
    } catch (err) {
      console.error('[StorageManager] Error initializing storage:', err);
      this.seedDefaultData();
    }
  }

  private seedDefaultData() {
    const demoPasswordHash = bcrypt.hashSync('jaravis2026', 10);
    const demoUser: User = {
      id: 'usr_demo_gautam',
      username: 'gautam',
      email: 'gautamkr.71019@gmail.com',
      passwordHash: demoPasswordHash,
      displayName: 'Gautam',
      callsign: 'Gautam',
      themeColor: 'cyan',
      voiceSettings: {
        pitch: 1.0,
        rate: 1.0,
        autoSpeak: true,
        soundEffects: true
      },
      assistantStyle: 'butler',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    };

    const initialNotes: Note[] = [
      {
        id: 'note_1',
        userId: 'usr_demo_gautam',
        title: 'Quantum Stabilization Algorithm',
        content: '# Core Formula\n`E = mc² + λ(Ψ ⊗ Φ)`\n- Calibrate containment field to 4.2 Tesla\n- Re-verify particle variance on Sector 7\n- Mark 48 flight telemetry testing tomorrow morning at 0800 hours.',
        tags: ['Physics', 'Mark-48', 'Urgent'],
        pinned: true,
        color: 'cyan',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'note_2',
        userId: 'usr_demo_gautam',
        title: 'React 19 Server Actions Notes',
        content: 'Explored optimistic updates and `useActionState` hook for JARAVIS dashboard telemetry. Server-side rendering reduces cold start latencies by 42%.',
        tags: ['Frontend', 'React', 'JARAVIS'],
        pinned: false,
        color: 'emerald',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'note_3',
        userId: 'usr_demo_gautam',
        title: 'Global Sat-Link Frequency Alignment',
        content: 'Synchronized orbital telemetry frequencies with Stark Tower secondary array. Uplink bandwidth locked at 100 Gbps.',
        tags: ['Telemetry', 'StarkNet'],
        pinned: true,
        color: 'amber',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    const initialCommands: CommandLog[] = [
      {
        id: 'cmd_seed_1',
        userId: 'usr_demo_gautam',
        rawInput: 'What is the current status of the global defense grid?',
        intent: 'ai_chat',
        status: 'success',
        responseText: 'All systems are operating at optimal parameters, Sir. Arc Reactor output is steady at 100%, auxiliary power reserves are fully charged, and localized defense protocols are armed in standby mode.',
        speakableText: 'All systems are operating at optimal parameters, Sir. Arc Reactor output is steady at 100%.',
        executionTimeMs: 340,
        tokensUsed: 48,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'cmd_seed_2',
        userId: 'usr_demo_gautam',
        rawInput: 'Search Google for the latest Java 21 LTS virtual threads features',
        intent: 'web_search',
        status: 'success',
        responseText: 'Java 21 LTS introduces production-ready **Virtual Threads (Project Loom)**, which are lightweight threads that dramatically reduce the throughput overhead of high-concurrency web servers. Key highlights include:\n\n1. **Million-Thread Capacity**: Run millions of virtual threads concurrently without exhausting OS threads.\n2. **Structured Concurrency (Preview)**: Simplifies error handling and cancellation.\n3. **Scoped Values**: Allows secure and efficient sharing of immutable data across threads.',
        speakableText: 'Java 21 LTS introduces Virtual Threads from Project Loom, enabling lightweight high-throughput concurrency with minimal OS thread overhead.',
        executionTimeMs: 620,
        tokensUsed: 120,
        searchSources: [
          { title: 'Oracle Java 21 Official Documentation', url: 'https://docs.oracle.com/en/java/javase/21/' },
          { title: 'Baeldung: Guide to Java 21 Virtual Threads', url: 'https://www.baeldung.com/java-21-virtual-threads' },
          { title: 'InfoQ: Java 21 Feature Breakdown', url: 'https://www.infoq.com/news/2023/09/java-21-released/' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'cmd_seed_3',
        userId: 'usr_demo_gautam',
        rawInput: 'What is the weather today in Malibu, California?',
        intent: 'weather',
        status: 'success',
        responseText: 'Current conditions in **Malibu, California**:\n- **Temperature**: 72°F (22°C)\n- **Conditions**: Sunny with gentle coastal breeze\n- **Humidity**: 48%\n- **Wind**: 8 mph WSW\n- **Flight Suit Advisory**: Optimal flight conditions across all Pacific corridors.',
        speakableText: 'In Malibu, California, it is 72 degrees and sunny with gentle coastal breezes. Optimal flight conditions, Sir.',
        executionTimeMs: 410,
        tokensUsed: 75,
        searchSources: [
          { title: 'National Weather Service - Malibu CA Forecast', url: 'https://forecast.weather.gov' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];

    this.data.users = [demoUser];
    this.data.notes = initialNotes;
    this.data.commands = initialCommands;
    this.data.reminders = [];
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageManager] Error writing storage file:', err);
    }
  }

  // Users
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Commands
  getCommandsByUserId(userId: string): CommandLog[] {
    return this.data.commands
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addCommand(cmd: CommandLog): CommandLog {
    this.data.commands.unshift(cmd);
    // Keep max 500 commands per storage
    if (this.data.commands.length > 500) {
      this.data.commands = this.data.commands.slice(0, 500);
    }
    this.save();
    return cmd;
  }

  deleteCommand(id: string, userId: string): boolean {
    const initialLen = this.data.commands.length;
    this.data.commands = this.data.commands.filter(c => !(c.id === id && c.userId === userId));
    const deleted = this.data.commands.length !== initialLen;
    if (deleted) this.save();
    return deleted;
  }

  clearCommands(userId: string): number {
    const before = this.data.commands.length;
    this.data.commands = this.data.commands.filter(c => c.userId !== userId);
    const count = before - this.data.commands.length;
    this.save();
    return count;
  }

  // Notes
  getNotesByUserId(userId: string): Note[] {
    return this.data.notes
      .filter(n => n.userId === userId)
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }

  getNoteById(id: string, userId: string): Note | undefined {
    return this.data.notes.find(n => n.id === id && n.userId === userId);
  }

  addNote(note: Note): Note {
    this.data.notes.unshift(note);
    this.save();
    return note;
  }

  updateNote(id: string, userId: string, updates: Partial<Note>): Note | undefined {
    const idx = this.data.notes.findIndex(n => n.id === id && n.userId === userId);
    if (idx === -1) return undefined;
    this.data.notes[idx] = {
      ...this.data.notes[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.notes[idx];
  }

  deleteNote(id: string, userId: string): boolean {
    const initialLen = this.data.notes.length;
    this.data.notes = this.data.notes.filter(n => !(n.id === id && n.userId === userId));
    const deleted = this.data.notes.length !== initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Reminders
  getRemindersByUserId(userId: string): Reminder[] {
    return this.data.reminders.filter(r => r.userId === userId);
  }

  addReminder(reminder: Reminder): Reminder {
    this.data.reminders.unshift(reminder);
    this.save();
    return reminder;
  }

  // Stats
  getStats() {
    return {
      totalUsers: this.data.users.length,
      totalCommands: this.data.commands.length,
      totalNotes: this.data.notes.length,
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    };
  }
}

export const storage = new StorageManager();
