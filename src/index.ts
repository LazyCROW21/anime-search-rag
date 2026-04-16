import { config } from "./config";
import sql from "./config/db";
import { animeRoutes } from "./modules/anime/anime.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { logger } from "./utils/logger";

logger.info(`📡 Starting Anime Search API on port ${config.port}...`);

const server = Bun.serve({
    port: config.port,
    async fetch(req) {
        // Handle health routes first (bypass DB check)
        const healthResponse = await healthRoutes(req);
        if (healthResponse) return healthResponse;

        // Check if database is ready for other requests
        try {
            const result = await sql`SELECT count(*) FROM anime`;
            const isReady = !!(result && result[0] && parseInt(result[0].count) >= 0);
            if (!isReady) throw new Error("Database not ready");
        } catch (error) {
            return Response.json({
                status: "DATABASE_NOT_READY",
                message: "Database setup is incomplete. Please call /health/reset to initialize.",
                error: (error as any).message
            }, { status: 503 });
        }

        // Handle anime routes
        const animeResponse = await animeRoutes(req);
        if (animeResponse) return animeResponse;

        return new Response("Not Found", { status: 404 });
    },
});



logger.info(`📡 Server running at http://localhost:${server.port}`);
