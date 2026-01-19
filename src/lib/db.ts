import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
    if (db) return db;

    // Use /tmp in Vercel for the database, otherwise use the local directory
    const dbPath = process.env.VERCEL
        ? path.join('/tmp', 'once_app.sqlite')
        : path.join(process.cwd(), 'once_app.sqlite');

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount REAL NOT NULL,
      amount_received REAL NOT NULL,
      change_returned REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    return db;
}
