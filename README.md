# Anime Semantic Search API

A production-quality semantic search system for anime using Nomic embeddings and PostgreSQL with pgvector.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Embedding Model**: `nomic-embed-text` (via Ollama HTTP API)
- **Database**: PostgreSQL with pgvector
- **API Framework**: Hono

## Prerequisites

1. **PostgreSQL** with pgvector extension
2. **Ollama** running locally
3. **Bun** runtime

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Ollama

```bash
# Install Ollama (if not already installed)
# Download from https://ollama.ai/

# Pull the Nomic embedding model
ollama pull nomic-embed-text

# Start Ollama server (usually runs on http://localhost:11434)
ollama serve
```

### 3. Setup PostgreSQL Database

```bash
# Create database
createdb anime_db

# Run the schema migration (adds embedding column to existing anime table)
psql -d anime_db -f db/schema.sql
```

### 4. Run the Server

```bash
bun run dev
```

Server will start on http://localhost:3000

## API Endpoints

### POST /api/embed-all

Embeds all anime that don't have embeddings yet.

```bash
curl -X POST http://localhost:3000/api/embed-all
```

### GET /api/search?q={query}

Traditional keyword-based search (searches name, english_name, genres).

```bash
curl "http://localhost:3000/api/search?q=action"
```

### GET /api/semantic-search?q={query}

Semantic search using embeddings.

```bash
curl "http://localhost:3000/api/semantic-search?q=space sci-fi with emotional story"
```

Response:
```json
{
  "query": "space sci-fi with emotional story",
  "results": [
    {
      "id": "12345",
      "title": "Some Anime Title",
      "summary": "...",
      "genres": ["Sci-Fi", "Drama"],
      "score": 0.85
    }
  ]
}
```

### GET /health

Check server health.

```bash
curl http://localhost:3000/health
```

### POST /health/reset

Reset database (runs schema.sql).

```bash
curl -X POST http://localhost:3000/health/reset
```

## Architecture

```
/src
├── config/
│   ├── db.ts          # PostgreSQL connection
│   └── index.ts       # App configuration
├── services/
│   ├── embedding.ts   # Ollama integration
│   └── search.ts      # Search logic with ranking
├── routes/
│   └── anime.routes.ts # API routes
├── modules/health/    # Health check endpoints
└── index.ts           # Server entry point
```

## Features

- **Batch Embedding**: Processes anime in batches of 20
- **Error Handling**: Retries failed embeddings up to 3 times
- **Enhanced Ranking**: Combines embedding similarity (70%) with keyword matching (30%)
- **Title Boosting**: Higher scores for title matches
- **Summary Penalization**: Reduces score for very short summaries
- **Vector Search**: Uses pgvector for efficient cosine similarity search

## Performance Considerations

- Embeddings are cached (only process NULL embeddings)
- Batch processing reduces API calls
- IVFFlat index on embeddings for fast search
- Connection pooling with postgres.js
