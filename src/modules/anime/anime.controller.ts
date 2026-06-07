import { animeService } from "./anime.service";
import { logger } from "../../utils/logger";
import { searchAnime } from "./anime.embedding.service";
import type { Context } from "hono";

export class AnimeController {
    public async search(c: Context) {
        const url = new URL(c.req.url);
        const query = url.searchParams.get("q");

        if (!query) {
            return c.json(
                { error: "Query parameter 'q' is required" },
                { status: 400 }
            );
        }

        const limit = parseInt(url.searchParams.get("limit") || "10");
        const results = await animeService.search(query, limit);

        return c.json({
            count: results.length,
            results,
        });

    }

    public async semanticSearch(c: Context) {
        try {
            const q = c.req.query('q');
            if (!q) {
                return c.json(
                    { error: "Query parameter 'q' is required" },
                    { status: 400 }
                );
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
    }
}

export const animeController = new AnimeController();
