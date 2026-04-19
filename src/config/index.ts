export const config = {
    port: parseInt(process.env.PORT || "3000"),
    datasetPath: "./src/assets/anime-dataset.csv",
    db: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "argusadmin",
        database: process.env.DB_NAME || "anime_db",
    },
    logLevel: process.env.LOG_LEVEL || "info",
    ollama: {
        url: process.env.OLLAMA_URL || "http://localhost:11434/api/embeddings",
        model: process.env.OLLAMA_MODEL || "nomic-embed-text",
        maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || "3"),
        retryDelay: parseInt(process.env.OLLAMA_RETRY_DELAY || "1000"),
    },
};
