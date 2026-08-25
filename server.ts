import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/auth';
import commandRoutes from './server/routes/commands';
import noteRoutes from './server/routes/notes';
import systemRoutes from './server/routes/system';
import chatRoutes from './server/routes/chat';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'JARAVIS Command Assistant API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/commands', commandRoutes);
  app.use('/api/assistant', commandRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/system', systemRoutes);

  // Vite Middleware for development / Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JARAVIS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[JARAVIS Server] Startup error:', err);
  process.exit(1);
});
