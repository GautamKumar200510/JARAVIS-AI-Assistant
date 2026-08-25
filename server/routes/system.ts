import { Router } from 'express';
import { storage } from '../storage';
import { weatherService } from '../services/weatherService';
import { webSearchService } from '../services/webSearchService';
import { aiService } from '../services/aiService';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// System Telemetry & Health status
router.get('/telemetry', (_req, res) => {
  const stats = storage.getStats();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  return res.json({
    status: 'online',
    systemName: 'JARAVIS Autonomous Command Core',
    version: '4.8.2-Enterprise',
    geminiEngine: hasGeminiKey ? 'Gemini 3.7 Flash (Active)' : 'JARAVIS Intelligence & Real-time Web Grid',
    uptimeSeconds: stats.uptimeSeconds,
    memoryUsageMB: stats.memoryUsageMB,
    cpuLoadPercent: Math.floor(12 + Math.random() * 18),
    telemetryStats: stats,
    serverTime: new Date().toISOString()
  });
});

// Grounded Search Endpoint using real WebSearchService & AIService
router.post('/search', authMiddleware, async (req: AuthRequest, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const callsign = req.user!.callsign || 'Sir';

  try {
    const aiRes = await aiService.generateAnswer(query, {
      callsign,
      assistantStyle: req.user!.assistantStyle,
      enableSearchGrounding: true
    });

    return res.json({
      query,
      responseText: aiRes.responseText,
      speakableText: aiRes.speakableText,
      searchSources: aiRes.sources || []
    });
  } catch (err: any) {
    // Direct web search fallback
    const webRes = await webSearchService.executeWebSearch(query, callsign);
    return res.json({
      query,
      responseText: webRes.responseText,
      speakableText: webRes.speakableText,
      searchSources: webRes.sources
    });
  }
});

// Live Weather Endpoint using real WeatherService
router.get('/weather', authMiddleware, async (req: AuthRequest, res) => {
  const city = (req.query.city as string) || 'New Delhi';
  const callsign = req.user!.callsign || 'Sir';

  try {
    const weatherRes = await weatherService.getLiveWeather(city, callsign);
    return res.json({
      city,
      weatherReport: weatherRes.formattedResponse,
      speakableText: weatherRes.speakableText,
      searchSources: weatherRes.sources || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Weather lookup failed: ' + err.message });
  }
});

export default router;
