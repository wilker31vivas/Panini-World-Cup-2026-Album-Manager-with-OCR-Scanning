import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'file:panini.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: databaseUrl,
  ...(authToken && { authToken }),
});

export default db;

export async function initializeDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS stickers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team VARCHAR(10) NOT NULL,
      number INTEGER NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      owned BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_code ON stickers(code);
    CREATE INDEX IF NOT EXISTS idx_team ON stickers(team);
  `;

  try {
    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
      }
    }
    console.log('✓ Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

