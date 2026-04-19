import { readFileSync } from "fs";
import sql from "../../config/db";
import { logger } from "../../utils/logger";

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
            const schema = readFileSync("db/schema.sql", "utf8");
            // The sql.unsafe() method allows running multiple statements from a string
            await sql.unsafe(schema);

            return {
                status: "SUCCESS",
                message: "Database has been reset."
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
