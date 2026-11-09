import path from 'path';
import express, { Express, Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiV1Router } from './routes/v1';
import { sanitizeRequestMiddleware, apiRateLimiter } from './middleware/security';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { UPLOADS_DIR } from './middleware/upload';
import { Project, SiteSettings } from './models';
import { AUTH_COOKIE_NAME } from './middleware/auth';
import { getDatabaseHealth } from './config/database';

const PORTFOLIO_IMAGES_DIR = path.resolve(process.cwd(), 'src/assets/images');

function isTrustedCorsOrigin(origin: string | undefined, req: Request): boolean {
  if (!origin) return true;

  const normalized = origin.replace(/\/$/, '').toLowerCase();
  const host = (req.get('host') || '').toLowerCase();
  if (host && (normalized === `http://${host}` || normalized === `https://${host}`)) {
    return true;
  }

  const configuredOrigins = [
    env.CLIENT_URL,
    env.APP_URL,
    ...env.ALLOWED_ORIGINS,
  ]
    .filter(Boolean)
    .map((item) => item.replace(/\/$/, '').toLowerCase());

  if (configuredOrigins.includes(normalized)) {
    return true;
  }

  // Allow Cloud Run / AI Studio preview origins over HTTPS
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.run\.app$/i.test(normalized)) {
    return true;
  }

  if (!env.IS_PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return true;
  }

  return false;
}

export function createExpressApp(): Express {
  const app = express();

  // Trust reverse proxy (Cloud Run / Nginx) for accurate client IP & secure cookies
  app.set('trust proxy', 1);

  // Security HTTP headers (allow embedding in AI Studio preview iframe)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false,
    })
  );

  // Strict origin-checked CORS for credentialed requests
  app.use(
    cors((req, callback) => {
      const requestOrigin = req.header('Origin');
      if (isTrustedCorsOrigin(requestOrigin, req)) {
        callback(null, { origin: true, credentials: true });
      } else {
        callback(null, { origin: false, credentials: false });
      }
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(sanitizeRequestMiddleware);
  app.use('/api/v1', (req, res, next) => {
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    if (!isStateChanging || !req.cookies?.[AUTH_COOKIE_NAME]) {
      next();
      return;
    }

    const origin = req.header('Origin');
    if (!origin || !isTrustedCorsOrigin(origin, req)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_ORIGIN_REJECTED',
          message: 'Request origin could not be verified.',
        },
      });
      return;
    }
    next();
  });

  app.get(['/health', '/api/health'], (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        database: getDatabaseHealth(),
      },
    });
  });

  // Serve uploaded media files with strict non-execution headers
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '7d',
      fallthrough: false,
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'none'; style-src 'unsafe-inline'; sandbox"
        );
      },
    })
  );

  // Serve seeded portfolio image assets in both dev and production builds (never source code)
  app.use('/src/assets/images', (req, res, next) => {
    if ('import' in req.query) {
      next();
      return;
    }
    express.static(PORTFOLIO_IMAGES_DIR, {
      maxAge: '30d',
      fallthrough: false,
      setHeaders: (staticRes) => {
        staticRes.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })(req, res, next);
  });

  // Dynamic robots.txt & sitemap.xml powered by MongoDB SiteSettings & Projects
  app.get('/robots.txt', async (req, res) => {
    const settings = await SiteSettings.findOne().catch(() => null);
    const robotsDirective = settings?.seo?.robots || 'index, follow';
    const baseUrl =
      settings?.seo?.canonicalUrl ||
      `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
    const disallowAll = robotsDirective.toLowerCase().includes('noindex');

    res.type('text/plain').send(
      [
        'User-agent: *',
        disallowAll ? 'Disallow: /' : 'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', async (req, res) => {
    const [settings, projects] = await Promise.all([
      SiteSettings.findOne().catch(() => null),
      Project.find({ published: true }).select('slug updatedAt').catch(() => []),
    ]);
    const baseUrl = (
      settings?.seo?.canonicalUrl ||
      `${req.protocol}://${req.get('host') || 'localhost:3000'}`
    ).replace(/\/$/, '');

    const staticRoutes = ['', '/projects', '/services', '/about', '/contact'];
    const urlsXml = [
      ...staticRoutes.map(
        (route) =>
          `<url><loc>${baseUrl}${route || '/'}</loc><changefreq>weekly</changefreq><priority>${
            route === '' ? '1.0' : '0.8'
          }</priority></url>`
      ),
      ...projects.map(
        (p) =>
          `<url><loc>${baseUrl}/projects/${p.slug}</loc><lastmod>${new Date(
            p.updatedAt || Date.now()
          ).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
      ),
    ].join('');

    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}</urlset>`
      );
  });

  // Mount Versioned REST API
  app.use('/api/v1', apiRateLimiter, apiV1Router);
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
