DROP TABLE IF EXISTS anime;

CREATE TABLE anime (
    anime_id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    english_name TEXT,
    other_name TEXT,
    score VARCHAR(20),
    genres TEXT,
    synopsis TEXT,
    type VARCHAR(50),
    episodes VARCHAR(50),
    aired TEXT,
    premiered TEXT,
    status VARCHAR(50),
    producers TEXT,
    licensors TEXT,
    studios TEXT,
    source TEXT,
    duration VARCHAR(50),
    rating VARCHAR(100),
    rank VARCHAR(50),
    popularity VARCHAR(50),
    favorites VARCHAR(50),
    scored_by VARCHAR(50),
    members VARCHAR(50),
    image_url TEXT
);
