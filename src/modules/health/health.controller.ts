import { readFileSync } from "fs";
import sql from "../../config/db";
import { animeModel } from "../anime/anime.model";
import { animeService } from "../anime/anime.service";
import { logger } from "../../utils/logger";

export class HealthController {
    public async check(req: Request) {
        let isDbReady = false;
        try {
            // Check if anime table exists and has entries
            const result = await sql`SELECT count(*) FROM anime`;
            isDbReady = !!(result && result[0] && parseInt(result[0].count) >= 0);
        } catch (error) {
            isDbReady = false;
        }

        const stats = await animeService.getStats();
        return Response.json({
            uptime: process.uptime(),
            database: isDbReady ? "CONNECTED" : "NOT_READY",
            appStatus: isDbReady ? "OK" : "DATABASE_NOT_READY",
            ...stats,
        });
    }

    public async reset(req: Request) {
        try {
            const schema = readFileSync("src/db/schema.sql", "utf8");
            // The sql.unsafe() method allows running multiple statements from a string
            await sql.unsafe(schema);

            // Seed the database
            const count = await animeModel.seed();

            return Response.json({
                status: "SUCCESS",
                message: `Database has been reset and seeded with ${count} entries.`
            });
        } catch (error: any) {
            logger.error("❌ Database reset failed:", error);
            return Response.json({
                status: "ERROR",
                message: error.message
            }, { status: 500 });
        }
    }
}

export const healthController = new HealthController();
