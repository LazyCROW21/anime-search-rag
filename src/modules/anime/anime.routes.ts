import { Hono } from 'hono';
import { embedAllAnime } from './anime.embedding.service';
import { animeController } from './anime.controller';
import { logger } from '../../utils/logger';

const app = new Hono();

// Traditional keyword-based search (existing functionality)
app.get('/search', animeController.search);

// Semantic search using embeddings
app.get('/semantic-search', animeController.semanticSearch);

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