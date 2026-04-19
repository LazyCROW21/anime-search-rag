-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Alter anime table to add embedding column
ALTER TABLE anime ADD COLUMN IF NOT EXISTS embedding VECTOR(768);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS anime_embedding_idx ON anime USING ivfflat (embedding vector_cosine_ops);