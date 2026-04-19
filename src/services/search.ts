import sql from '../config/db';
import { embedText } from './embedding';
import { logger } from '../utils/logger';

const BATCH_SIZE = 20;

export interface Anime {
    id: string;
    title: string;
    summary: string | null;
    genres: string[] | null;
    embedding: number[] | null;
}

export async function embedAllAnime(): Promise<void> {
    logger.info('Starting embedding process for all anime...');

    let processed = 0;
    let total = 0;

    // Get total count first
    const countResult = await sql`SELECT COUNT(*) as total FROM anime WHERE embedding IS NULL`;
    total = parseInt(countResult[0].total);

    if (total === 0) {
        logger.info('All anime are already embedded');
        return;
    }

    logger.info(`Found ${total} anime to embed`);

    while (true) {
        // Fetch batch of anime without embeddings
        const anime = await sql<Anime[]>`
            SELECT id, title, summary, genres
            FROM anime
            WHERE embedding IS NULL
            LIMIT ${BATCH_SIZE}
        `;

        if (anime.length === 0) {
            break;
        }

        logger.info(`Processing batch of ${anime.length} anime...`);

        // Process each anime in the batch
        const updates = await Promise.all(
            anime.map(async (item) => {
                try {
                    // Combine fields into text
                    const text = `Title: ${item.title}. Genres: ${item.genres?.join(', ') || 'N/A'}. Summary: ${item.summary || 'N/A'}`;

                    // Generate embedding
                    const embedding = await embedText(text);

                    return {
                        id: item.id,
                        embedding,
                    };
                } catch (error) {
                    logger.error(`Failed to embed anime ${item.id}: ${(error as Error).message}`);
                    return null;
                }
            })
        );

        // Filter out failed embeddings
        const validUpdates = updates.filter(update => update !== null);

        // Batch update the database
        if (validUpdates.length > 0) {
            for (const update of validUpdates) {
                await sql`
                    UPDATE anime
                    SET embedding = ${`[${update!.embedding.join(',')}]`}::vector
                    WHERE id = ${update!.id}
                `;
            }
        }

        processed += anime.length;
        logger.info(`Processed ${processed}/${total} anime`);
    }

    logger.info('Embedding process completed');
}

export async function searchAnime(query: string, limit: number = 5): Promise<Array<Anime & { score: number }>> {
    // Generate embedding for query
    const queryEmbedding = await embedText(query);

    // Get candidates with embedding similarity
    const candidates = await sql<Array<Anime & { embedding_score: number }>>`
        SELECT id, title, summary, genres, embedding,
               1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as embedding_score
        FROM anime
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
        LIMIT ${limit * 2}  -- Get more candidates for ranking
    `;

    // Calculate enhanced scores
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    const results = candidates.map(anime => {
        let keywordScore = 0;

        // Title similarity boost
        const titleLower = anime.title.toLowerCase();
        const titleMatch = queryWords.filter(word => titleLower.includes(word)).length;
        keywordScore += titleMatch * 0.5; // Boost for title matches

        // Genre matches
        if (anime.genres) {
            const genreMatch = queryWords.filter(word =>
                anime.genres!.some(genre => genre.toLowerCase().includes(word))
            ).length;
            keywordScore += genreMatch * 0.3;
        }

        // Summary matches
        if (anime.summary) {
            const summaryLower = anime.summary.toLowerCase();
            const summaryMatch = queryWords.filter(word => summaryLower.includes(word)).length;
            keywordScore += summaryMatch * 0.2;
        }

        // Penalize very short summaries
        const summaryPenalty = anime.summary && anime.summary.length < 50 ? 0.1 : 0;

        // Normalize keyword score (0-1)
        keywordScore = Math.min(keywordScore / queryWords.length, 1);

        // Combine scores
        const finalScore = 0.7 * anime.embedding_score + 0.3 * keywordScore - summaryPenalty;

        return {
            ...anime,
            score: Math.max(finalScore, 0), // Ensure non-negative
        };
    });

    // Sort by final score and return top results
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}