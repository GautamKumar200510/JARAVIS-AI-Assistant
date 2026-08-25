import { Router } from 'express';
import { authMiddleware, AuthRequest } from './auth';
import { storage, CommandLog, SearchSource } from '../storage';
import { commandService } from '../services/commandService';

const router = Router();

// Streaming Execute handler via Server-Sent Events (SSE)
const handleStreamExecute = async (req: AuthRequest, res: any) => {
  const startTime = Date.now();
  const userId = req.user!.id;
  const { command, model } = req.body;

  if (!command || typeof command !== 'string' || !command.trim()) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const rawInput = command.trim();
  const abortController = new AbortController();

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders?.();

  // Handle client disconnect / cancellation
  req.on('close', () => {
    abortController.abort();
  });

  const sendEvent = (event: string, data: any) => {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    const userProfile = {
      userId,
      displayName: req.user!.displayName,
      callsign: req.user!.callsign,
      assistantStyle: req.user!.assistantStyle
    };

    const selectedModel = (typeof model === 'string' && model) ? model : 'gemini-3.7-flash';

    sendEvent('start', {
      rawInput,
      model: selectedModel,
      callsign: userProfile.callsign
    });

    let accumulatedText = '';

    const result = await commandService.executeStream(
      rawInput,
      userProfile,
      {
        onIntent: (intent, actionPayload) => {
          sendEvent('intent', { intent, actionPayload });
        },
        onChunk: (chunk) => {
          accumulatedText += chunk;
          sendEvent('chunk', { delta: chunk, textSoFar: accumulatedText });
        },
        onSources: (sources: SearchSource[]) => {
          sendEvent('sources', { sources });
        }
      },
      selectedModel,
      abortController.signal
    );

    // Fetch the stored log to return
    const logs = storage.getCommandsByUserId(userId);
    const savedLog = logs[0] || {
      id: 'cmd_' + Date.now().toString(36),
      userId,
      rawInput,
      intent: result.intent,
      status: result.status,
      responseText: result.responseText,
      speakableText: result.speakableText,
      executionTimeMs: result.executionTimeMs,
      searchSources: result.searchSources,
      actionPayload: result.actionPayload,
      createdAt: new Date().toISOString()
    };

    sendEvent('done', {
      command: savedLog,
      createdNote: result.createdNote,
      intent: result.intent,
      responseText: result.responseText,
      speakableText: result.speakableText,
      searchSources: result.searchSources,
      actionPayload: result.actionPayload,
      executionTimeMs: result.executionTimeMs
    });

    res.write('event: end\ndata: {}\n\n');
    res.end();
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    const errorLog: CommandLog = {
      id: 'cmd_err_' + Date.now().toString(36),
      userId,
      rawInput,
      intent: 'ai_chat',
      status: 'error',
      responseText: `Could not process your request: ${err.message || 'Internal processing error'}`,
      speakableText: `An error occurred while executing the command, ${req.user!.callsign}.`,
      executionTimeMs,
      createdAt: new Date().toISOString()
    };
    storage.addCommand(errorLog);

    sendEvent('error', {
      error: err.message || 'Streaming execution error',
      command: errorLog
    });
    res.end();
  }
};

// Execute handler implementation
const handleExecute = async (req: AuthRequest, res: any) => {
  const startTime = Date.now();
  const userId = req.user!.id;
  const { command, model } = req.body;

  if (!command || typeof command !== 'string' || !command.trim()) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const rawInput = command.trim();

  try {
    const userProfile = {
      userId,
      displayName: req.user!.displayName,
      callsign: req.user!.callsign,
      assistantStyle: req.user!.assistantStyle
    };

    const selectedModel = (typeof model === 'string' && model) ? model : 'gemini-3.7-flash';

    // Orchestrate command through CommandService
    const result = await commandService.execute(rawInput, userProfile, selectedModel);

    // Fetch the stored log to return
    const logs = storage.getCommandsByUserId(userId);
    const savedLog = logs[0] || {
      id: 'cmd_' + Date.now().toString(36),
      userId,
      rawInput,
      intent: result.intent,
      status: result.status,
      responseText: result.responseText,
      speakableText: result.speakableText,
      executionTimeMs: result.executionTimeMs,
      searchSources: result.searchSources,
      actionPayload: result.actionPayload,
      createdAt: new Date().toISOString()
    };

    return res.json({
      command: savedLog,
      createdNote: result.createdNote,
      intent: result.intent,
      responseText: result.responseText,
      speakableText: result.speakableText,
      searchSources: result.searchSources,
      actionPayload: result.actionPayload
    });
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    const errorLog: CommandLog = {
      id: 'cmd_err_' + Date.now().toString(36),
      userId,
      rawInput,
      intent: 'ai_chat',
      status: 'error',
      responseText: `Could not process your request: ${err.message || 'Internal processing error'}`,
      speakableText: `An error occurred while executing the command, ${req.user!.callsign}.`,
      executionTimeMs,
      createdAt: new Date().toISOString()
    };
    storage.addCommand(errorLog);
    return res.status(500).json({ error: err.message, command: errorLog });
  }
};

// Route for streaming executing commands
router.post('/stream', authMiddleware, handleStreamExecute);

// Route for executing commands (/api/commands/execute and /api/assistant/command)
router.post('/execute', authMiddleware, handleExecute);
router.post('/command', authMiddleware, handleExecute);

// Get command history
router.get('/history', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { intent, query, limit = '50' } = req.query;

  let list = storage.getCommandsByUserId(userId);

  if (intent && typeof intent === 'string' && intent !== 'all') {
    list = list.filter(c => c.intent === intent);
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(c =>
      c.rawInput.toLowerCase().includes(q) ||
      c.responseText.toLowerCase().includes(q)
    );
  }

  const maxItems = Math.min(parseInt(limit as string, 10) || 50, 200);
  return res.json({ commands: list.slice(0, maxItems) });
});

// Delete specific command log
router.delete('/history/:id', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const success = storage.deleteCommand(id, userId);
  return res.json({ success });
});

// Clear all command history
router.delete('/history', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const count = storage.clearCommands(userId);
  return res.json({ success: true, count });
});

export default router;

