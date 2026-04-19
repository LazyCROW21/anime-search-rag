import { Hono } from 'hono';
import { config } from './config';
import sql from './config/db';
import { animeRoutes } from './modules/anime/anime.routes';
import { healthRoutes } from './modules/health/health.routes';
import { logger } from './utils/logger';

const app = new Hono();

// Health routes
app.route('/health', healthRoutes);

// Anime routes
app.route('/api', animeRoutes);

// Database readiness check middleware
app.use('*', async (c, next) => {
    if (c.req.path.startsWith('/health')) {
        return next();
    }

    try {
        const result = await sql`SELECT count(*) FROM anime`;
        const isReady = !!(result && result[0] && parseInt(result[0].count) >= 0);
        if (!isReady) throw new Error('Database not ready');
    } catch (error) {
        return c.json({
            status: 'DATABASE_NOT_READY',
            message: 'Database setup is incomplete.',
            error: (error as any).message
        }, 503);
    }

    return next();
});

logger.info(`📡 Starting Anime Search API on port ${config.port}...`);

export default {
    port: config.port,
    fetch: app.fetch,
};
