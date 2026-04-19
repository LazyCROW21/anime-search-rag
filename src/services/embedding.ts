import { config } from '../config';
import { logger } from '../utils/logger';

const OLLAMA_URL = config.ollama.url;
const MODEL = config.ollama.model;
const MAX_RETRIES = config.ollama.maxRetries;
const RETRY_DELAY = config.ollama.retryDelay;

// Simple in-memory cache for query embeddings
const embeddingCache = new Map<string, number[]>();

export async function embedText(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.trim().toLowerCase();
    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey)!;
    }

    // Normalize input
    const normalizedText = cacheKey;

    if (!normalizedText) {
        throw new Error('Empty text provided for embedding');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL,
                    prompt: normalizedText,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.embedding || !Array.isArray(data.embedding)) {
                throw new Error('Invalid embedding response from Ollama');
            }

            // Cache the result
            embeddingCache.set(cacheKey, data.embedding);

            return data.embedding;
        } catch (error) {
            lastError = error as Error;
            logger.warn(`Embedding attempt ${attempt} failed: ${lastError.message}`);

            if (attempt < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }
    }

    throw new Error(`Failed to generate embedding after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}