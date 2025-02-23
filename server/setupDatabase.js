import fs from "fs";
import path from "path";
import pool from "./config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const dbCheck = await pool.query("SELECT current_database();");
    console.log("Connected to database:", dbCheck.rows[0].current_database);

    const result = await pool.query(schema);
    console.log("Database schema execution result:", result);

    console.log("Database schema created successfully.");
  } catch (err) {
    console.error("Error creating database schema:", err);
  } finally {
    await pool.end();
  }
};

runSchema();
