import postgres from "postgres";
import { config } from "./index";

const sql = postgres({
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

export default sql;
