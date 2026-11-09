import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  env,
  getSmtpConfigIssues,
  validateInitialAdminConfig,
} from './server/src/config/env';
import { connectDatabase, disconnectDatabase } from './server/src/config/database';
import { ensureSeededDatabase } from './server/src/services/seedService';
import { createExpressApp } from './server/src/app';
import { errorHandler } from './server/src/middleware/errorHandler';

async function startFullStackServer() {
  validateInitialAdminConfig();
  const smtpIssues = getSmtpConfigIssues();
  if (smtpIssues.length > 0) {
    console.warn(
      `[Email] SMTP is not ready; contact notifications will be skipped. ${smtpIssues.join('; ')}.`
    );
  } else {
    console.info(
      '[Email] SMTP settings passed local validation; connection and authentication are checked when sending.'
    );
  }
  await connectDatabase();
  await ensureSeededDatabase(false);

  const app = createExpressApp();
  const port = env.PORT || 3000;

  const httpServer = app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Mahim Dev Portfolio & CMS listening on http://0.0.0.0:${port} (${env.NODE_ENV})`);
  });

  if (!env.IS_PROD) {
    const hmrPort = Number(process.env.VITE_HMR_PORT || port);
    const hmrConfig: Record<string, unknown> = {
      host: 'localhost',
      protocol: 'ws',
      clientPort: port,
    };

    if (process.env.VITE_HMR_PORT) {
      hmrConfig.port = hmrPort;
    } else {
      hmrConfig.server = httpServer;
    }

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: hmrConfig,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '7d' }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/src/') || req.path.startsWith('/uploads/')) {
        res.status(404).json({
          success: false,
          error: { code: 'ASSET_NOT_FOUND', message: 'Static asset not found.' },
        });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  let isShuttingDown = false;
  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.info(`[Server] ${signal} received; closing server.`);

    httpServer.close((error) => {
      if (error) {
        console.error('[Server] Failed to close the HTTP server cleanly.');
        process.exitCode = 1;
      }

      void disconnectDatabase().catch(() => {
        console.error('[MongoDB] Failed to close the database connection cleanly.');
        process.exitCode = 1;
      });
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startFullStackServer().catch((err) => {
  console.error('[Fatal] Failed to launch full-stack server:', err);
  process.exit(1);
});
