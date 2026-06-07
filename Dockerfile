# Use the official PostgreSQL 17 image as the base
FROM postgres:17

# Install the pgvector extension
# The official postgres image includes the official PostgreSQL repository (pgdg), 
# which contains the postgresql-17-pgvector package.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-17-pgvector && \
    rm -rf /var/lib/apt/lists/*
