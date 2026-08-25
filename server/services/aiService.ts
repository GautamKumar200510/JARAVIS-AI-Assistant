import { GoogleGenAI } from '@google/genai';
import { SearchSource } from '../storage';
import { webSearchService } from './webSearchService';

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface AIResponse {
  responseText: string;
  speakableText: string;
  sources?: SearchSource[];
  isRealAI: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

// In-memory cache for safe, repeated factual/coding questions (TTL: 10 minutes)
interface CacheEntry {
  response: AIResponse;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class AIService {
  /**
   * Cleans text to produce natural, smooth speech for browser SpeechSynthesis.
   */
  public cleanSpeakableText(fullText: string, callsign: string = 'Sir'): string {
    if (!fullText) return `Completed, ${callsign}.`;

    const clean = fullText
      // Replace code blocks with concise spoken description
      .replace(/```[a-zA-Z]*\n[\s\S]*?\n```/g, 'Code implementation provided.')
      .replace(/`([^`]+)`/g, '$1')
      // Clean markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers, bold, italics, math symbols
      .replace(/[#*_~$\\]/g, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Replace multiple whitespace/newlines
      .replace(/\s+/g, ' ')
      .trim();

    // Extract first 2 complete sentences (up to 220 chars)
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    const spoken = sentences.slice(0, 2).join(' ').trim();
    if (spoken.length > 230) {
      return spoken.slice(0, 227) + '...';
    }
    return spoken || `Processing complete, ${callsign}.`;
  }

  /**
   * Build optimized system instruction for J.A.R.V.I.S.
   */
  private buildSystemInstruction(callsign: string, assistantStyle: string): string {
    return `You are J.A.R.V.I.S., a sophisticated, articulate, and highly capable AI assistant built for precision, clarity, and speed.
The user's honorific/callsign is "${callsign}".
Assistant Style Profile: ${assistantStyle}.

CORE DIRECTIVES:
1. Answer questions directly, accurately, and naturally — just like modern top-tier AI assistants (e.g. ChatGPT, Gemini).
2. For coding questions: Provide complete, correct, idiomatic, executable code with clear explanations and best practices.
3. For mathematical & STEM questions: Provide step-by-step logic, exact formulas, and correct final numerical values.
4. For general knowledge, history, literature, logic, and concepts: Deliver structured, engaging, informative answers without unnecessary waffle.
5. Formatting: Use clean Markdown (bold headings, bullet points, numbered steps, code fences with syntax highlighting).
6. Tone: Highly intelligent, respectful, efficient, and conversational. Address the user as "${callsign}" naturally when appropriate.
7. Strictly avoid empty robotic acknowledgments like "Acknowledged, I have processed your instruction", "System online", or "All compute arrays standing by". Answer the user's actual prompt immediately.
8. If uncertain or if information is genuinely unverified, state uncertainty transparently rather than hallucinating facts or URLs.`;
  }

  /**
   * Format previous conversation history for Gemini multi-turn chat
   */
  private formatConversationHistory(history?: ConversationTurn[], currentPrompt?: string): any[] {
    const contents: any[] = [];

    if (history && history.length > 0) {
      // Keep up to last 6 turns to maintain tight context without token lag
      const recentTurns = history.slice(-6);
      for (const turn of recentTurns) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }
    }

    if (currentPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: currentPrompt }]
      });
    }

    return contents;
  }

  /**
   * Stream response tokens via Server-Sent Events (SSE) or chunk callback
   */
  public async generateAnswerStream(
    prompt: string,
    callbacks: {
      onChunk: (text: string) => void;
      onSources?: (sources: SearchSource[]) => void;
    },
    options?: {
      modelName?: string;
      callsign?: string;
      assistantStyle?: string;
      enableSearchGrounding?: boolean;
      history?: ConversationTurn[];
      signal?: AbortSignal;
    }
  ): Promise<AIResponse> {
    const callsign = options?.callsign || 'Sir';
    const style = options?.assistantStyle || 'butler';
    const model = options?.modelName || 'gemini-3.7-flash';
    const enableSearch = options?.enableSearchGrounding ?? false;
    const history = options?.history || [];

    const ai = getGenAI();

    if (ai) {
      try {
        const systemInstruction = this.buildSystemInstruction(callsign, style);
        const contents = this.formatConversationHistory(history, prompt);

        const config: any = {
          systemInstruction,
          temperature: 0.7,
        };

        if (enableSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config
        });

        let accumulatedText = '';
        const sources: SearchSource[] = [];

        for await (const chunk of responseStream) {
          if (options?.signal?.aborted) {
            break;
          }

          const chunkText = chunk.text;
          if (chunkText) {
            accumulatedText += chunkText;
            callbacks.onChunk(chunkText);
          }

          // Extract grounding metadata if provided during stream
          const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (groundingChunks && Array.isArray(groundingChunks)) {
            for (const gChunk of groundingChunks) {
              if (gChunk.web?.uri) {
                const url = gChunk.web.uri;
                if (!sources.some(s => s.url === url)) {
                  sources.push({
                    title: gChunk.web.title || new URL(url).hostname,
                    url
                  });
                }
              }
            }
            if (callbacks.onSources && sources.length > 0) {
              callbacks.onSources(sources.slice(0, 5));
            }
          }
        }

        if (accumulatedText.trim()) {
          const result: AIResponse = {
            responseText: accumulatedText,
            speakableText: this.cleanSpeakableText(accumulatedText, callsign),
            sources: sources.slice(0, 5),
            isRealAI: true
          };

          // Cache answer if general inquiry
          if (!enableSearch && history.length === 0) {
            queryCache.set(prompt.trim().toLowerCase(), {
              response: result,
              timestamp: Date.now()
            });
          }

          return result;
        }
      } catch (err: any) {
        console.warn('[AIService] Streaming Gemini API error, falling back:', err?.message);
      }
    }

    // Fallback: Non-streaming generation if stream fails
    const fallbackRes = await this.generateAnswer(prompt, options);
    callbacks.onChunk(fallbackRes.responseText);
    if (fallbackRes.sources && callbacks.onSources) {
      callbacks.onSources(fallbackRes.sources);
    }
    return fallbackRes;
  }

  /**
   * Generates a direct, factual answer using Gemini 3.7 Flash or fallback Web service
   */
  public async generateAnswer(
    prompt: string,
    options?: {
      modelName?: string;
      callsign?: string;
      assistantStyle?: string;
      enableSearchGrounding?: boolean;
      history?: ConversationTurn[];
    }
  ): Promise<AIResponse> {
    const callsign = options?.callsign || 'Sir';
    const style = options?.assistantStyle || 'butler';
    const model = options?.modelName || 'gemini-3.7-flash';
    const enableSearch = options?.enableSearchGrounding ?? false;
    const history = options?.history || [];
    const cacheKey = prompt.trim().toLowerCase();

    // Check cache for safe repeated queries
    if (!enableSearch && history.length === 0) {
      const cached = queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.response;
      }
    }

    const ai = getGenAI();

    // 1. Try Gemini API first
    if (ai) {
      try {
        const systemInstruction = this.buildSystemInstruction(callsign, style);
        const contents = this.formatConversationHistory(history, prompt);

        const config: any = {
          systemInstruction,
          temperature: 0.7
        };

        if (enableSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config
        });

        const rawText = response.text;

        if (rawText && rawText.trim()) {
          const sources: SearchSource[] = [];

          // Extract grounding metadata if search grounding was enabled
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks && Array.isArray(chunks)) {
            for (const chunk of chunks) {
              if (chunk.web?.uri) {
                sources.push({
                  title: chunk.web.title || new URL(chunk.web.uri).hostname,
                  url: chunk.web.uri
                });
              }
            }
          }

          const result: AIResponse = {
            responseText: rawText,
            speakableText: this.cleanSpeakableText(rawText, callsign),
            sources: sources.slice(0, 5),
            isRealAI: true
          };

          if (!enableSearch && history.length === 0) {
            queryCache.set(cacheKey, {
              response: result,
              timestamp: Date.now()
            });
          }

          return result;
        }
      } catch (err: any) {
        console.warn('[AIService] Gemini API generation error, engaging fallback:', err?.message);
      }
    }

    // 2. Factual Web/Wikipedia fallback if Gemini API is offline or not configured
    const webResult = await webSearchService.executeWebSearch(prompt, callsign);
    if (webResult && webResult.success) {
      return {
        responseText: webResult.responseText,
        speakableText: this.cleanSpeakableText(webResult.speakableText, callsign),
        sources: webResult.sources,
        isRealAI: false
      };
    }

    // 3. Mathematical deterministic computation fallback
    const mathMatch = prompt.match(/calculate\s+(.+)|what\s+is\s+([0-9\s+\-*/%^().]+)/i);
    if (mathMatch) {
      const expr = (mathMatch[1] || mathMatch[2] || '').trim();
      try {
        if (/^[0-9+\-*/%^().\s]+$/.test(expr)) {
          const sanitized = expr.replace(/\^/g, '**');
          const result = Function(`"use strict"; return (${sanitized})`)();
          return {
            responseText: `### 🔢 Calculation Result\n\n$$\\mathbf{${expr}} = \\mathbf{${result}}$$\n\n*Verified mathematical computation completed.*`,
            speakableText: `The result of ${expr} is ${result}, ${callsign}.`,
            sources: [],
            isRealAI: false
          };
        }
      } catch {
        // ignore
      }
    }

    // 4. Clean, honest response if intelligence stream is unavailable
    return {
      responseText: `I processed your inquiry: **"${prompt}"**.\n\nCould not connect to the live intelligence engine at this moment. If you have an active Gemini API key, verify it in the project settings panel.`,
      speakableText: `I was unable to retrieve live intelligence for your inquiry at this moment, ${callsign}.`,
      sources: [],
      isRealAI: false
    };
  }
}

export const aiService = new AIService();

