import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface StickerData {
  team: string;
  number: number;
  code: string;
}

const databaseUrl = process.env.DATABASE_URL || 'file:panini.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: databaseUrl,
  ...(authToken && { authToken }),
});

async function seed() {
  try {
    console.log('Creating stickers table...');

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

    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
      }
    }
    console.log('✓ Table created');

    let dataPath = path.join(__dirname, 'stickers.json');
    if (!fs.existsSync(dataPath)) {
      dataPath = path.join(__dirname, '..', 'stickers.json');
    }

    if (!fs.existsSync(dataPath)) {
      console.log('⚠ No stickers.json found. Please create it with your sticker data.');
      console.log('Expected format:');
      console.log('[');
      console.log('  { "team": "BRA", "number": 1, "code": "BRA 1" },');
      console.log('  { "team": "BRA", "number": 2, "code": "BRA 2" }');
      console.log(']');
      process.exit(1);
    }

    console.log('Loading sticker data...');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const stickers: StickerData[] = JSON.parse(rawData);

    console.log(`Found ${stickers.length} stickers`);

    // Clear existing data
    console.log('Clearing existing data...');
    await db.execute('DELETE FROM stickers');

    // Insert stickers
    console.log('Inserting stickers...');
    let inserted = 0;
    for (const sticker of stickers) {
      try {
        await db.execute({
          sql: 'INSERT INTO stickers (team, number, code) VALUES (?, ?, ?)',
          args: [sticker.team, sticker.number, sticker.code],
        });
        inserted++;
      } catch (err) {
        console.warn(`Warning: Failed to insert ${sticker.code}:`, err);
      }
    }

    console.log(`✓ Seeded ${inserted} stickers successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
