import { commandService } from './services/commandService';
import { SearchSource, StorageCommandIntent } from './storage';

export interface IntentResult {
  intent: StorageCommandIntent;
  responseText: string;
  speakableText: string;
  searchSources?: SearchSource[];
  extractedNote?: {
    title: string;
    content: string;
    tags: string[];
  };
  extractedReminder?: {
    title: string;
    timeStr: string;
  };
}

export async function processCommand(
  rawInput: string,
  userProfile?: { displayName: string; callsign: string; assistantStyle: string }
): Promise<IntentResult> {
  const profile = {
    userId: 'legacy_user',
    displayName: userProfile?.displayName || 'User',
    callsign: userProfile?.callsign || 'Sir',
    assistantStyle: userProfile?.assistantStyle || 'butler'
  };

  const result = await commandService.execute(rawInput, profile);

  return {
    intent: result.intent,
    responseText: result.responseText,
    speakableText: result.speakableText,
    searchSources: result.searchSources,
    extractedNote: result.createdNote ? {
      title: result.createdNote.title,
      content: result.createdNote.content,
      tags: result.createdNote.tags
    } : undefined
  };
}
