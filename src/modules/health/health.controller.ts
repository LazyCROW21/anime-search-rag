import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import sql from "../../config/db";
import { logger } from "../../utils/logger";
import { animeModel } from "../anime/anime.model";

export class HealthController {
    public async check() {
        let isDbReady = false;
        try {
            // Check if anime table exists and has entries
            const result = await sql`SELECT count(*) FROM anime`;
            isDbReady = !!(result && result[0] && parseInt(result[0].count) >= 0);
        } catch (error) {
            isDbReady = false;
        }

        return {
            uptime: process.uptime(),
            database: isDbReady ? "CONNECTED" : "NOT_READY",
            appStatus: isDbReady ? "OK" : "DATABASE_NOT_READY",
        };
    }

    public async reset() {
        try {
            const dbFolder = join(process.cwd(), "src", "db");
            const files = readdirSync(dbFolder)
                .filter(file => file.endsWith(".sql"))
                .sort();

            for (const file of files) {
                const filePath = join(dbFolder, file);
                const schema = readFileSync(filePath, "utf8");
                logger.info(`🔄 Running SQL file: ${file}`);
                // The sql.unsafe() method allows running multiple statements from a string
                await sql.unsafe(schema);
            }

            // Seed the database
            const count = await animeModel.seed();

            return {
                status: "SUCCESS",
                message: `Database has been reset with all schema files and seeded with ${count} anime entries.`
            };
        } catch (error: any) {
            logger.error("❌ Database reset failed:", error);
            return {
                status: "ERROR",
                message: error.message
            };
        }
    }
}

export const healthController = new HealthController();
