import { Hono } from 'hono';
import { embedAllAnime, searchAnime } from '../../services/search';
import { animeController } from './anime.controller';
import { logger } from '../../utils/logger';

const app = new Hono();

// Traditional keyword-based search (existing functionality)
app.get('/search', async (c) => {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '10');

    if (!query) {
        return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    try {
        const results = await animeController.search(c.req);
        const data = await results.json();
        return c.json(data);
    } catch (error) {
        logger.error(`Error in traditional search: ${(error as Error).message}`);
        return c.json({ error: 'Search failed' }, 500);
    }
});

// Semantic search using embeddings
app.get('/semantic-search', async (c) => {
    try {
        const q = c.req.query('q');
        if (!q) {
            return c.json({ error: 'Query parameter "q" is required' }, 400);
        }

        logger.info(`Semantic searching for: ${q}`);
        const results = await searchAnime(q);

        return c.json({
            query: q,
            results: results.map(r => ({
                id: r.id,
                title: r.title,
                summary: r.summary,
                genres: r.genres,
                score: r.score,
            })),
        });
    } catch (error) {
        logger.error(`Error in semantic search: ${(error as Error).message}`);
        return c.json({ error: 'Semantic search failed' }, 500);
    }
});

// Embed all anime
app.post('/embed-all', async (c) => {
    try {
        logger.info('Received request to embed all anime');
        await embedAllAnime();
        return c.json({ message: 'Embedding process completed' });
    } catch (error) {
        logger.error(`Error in embed-all: ${(error as Error).message}`);
        return c.json({ error: 'Failed to embed anime' }, 500);
    }
});

export { app as animeRoutes };