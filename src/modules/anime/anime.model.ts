import Papa from "papaparse";
import { readFileSync } from "fs";
import { config } from "../../config";
import sql from "../../config/db";
import { logger } from "../../utils/logger";

export interface Anime {
    anime_id: string;
    name: string;
    english_name: string;
    other_name: string;
    score: string;
    genres: string;
    synopsis: string;
    type: string;
    episodes: string;
    aired: string;
    premiered: string;
    status: string;
    producers: string;
    licensors: string;
    studios: string;
    source: string;
    duration: string;
    rating: string;
    rank: string;
    popularity: string;
    favorites: string;
    scored_by: string;
    members: string;
    image_url: string;
}

class AnimeModel {
    public async search(query: string, limit: number): Promise<Anime[]> {
        const ilike = `%${query}%`;
        // Using sql`...` automatically handles escaping and parameterization
        return await sql<Anime[]>`
            SELECT * FROM anime 
            WHERE name ILIKE ${ilike} 
               OR english_name ILIKE ${ilike} 
               OR genres ILIKE ${ilike}
            LIMIT ${limit}
        `;
    }

    public async getCount(): Promise<number> {
        try {
            const result = await sql`SELECT count(*) FROM anime`;
            return result && result[0] ? parseInt(result[0].count) : 0;
        } catch (error) {
            return 0;
        }
    }

    public async seed(): Promise<number> {
        logger.info("🚀 Seeding database from CSV...");
        const csvFile = readFileSync(config.datasetPath, "utf8");
        const results = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
        });

        const entries = results.data.map((row: any) => ({
            anime_id: row["anime_id"],
            name: row["Name"],
            english_name: row["English name"],
            other_name: row["Other name"],
            score: row["Score"],
            genres: row["Genres"],
            synopsis: row["Synopsis"],
            type: row["Type"],
            episodes: row["Episodes"],
            aired: row["Aired"],
            premiered: row["Premiered"],
            status: row["Status"],
            producers: row["Producers"],
            licensors: row["Licensors"],
            studios: row["Studios"],
            source: row["Source"],
            duration: row["Duration"],
            rating: row["Rating"],
            rank: row["Rank"],
            popularity: row["Popularity"],
            favorites: row["Favorites"],
            scored_by: row["Scored By"],
            members: row["Members"],
            image_url: row["Image URL"]
        }));

        // Batch insert for better performance, but chunk it to avoid too many parameters
        const chunkSize = 500;
        if (entries.length > 0) {
            for (let i = 0; i < entries.length; i += chunkSize) {
                const chunk = entries.slice(i, i + chunkSize);
                // postgres.js supports batch insert using sql`INSERT INTO ... ${sql(entries)}`
                await sql`INSERT INTO anime ${sql(chunk)}`;
                logger.info(`📡 Inserted ${Math.min(i + chunkSize, entries.length)} / ${entries.length} entries...`);
            }
        }

        logger.info(`✅ Seeded ${entries.length} anime entries into database.`);
        return entries.length;
    }
}


export const animeModel = new AnimeModel();

