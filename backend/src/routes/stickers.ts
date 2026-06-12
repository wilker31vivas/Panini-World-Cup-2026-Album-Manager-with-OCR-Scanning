import { Router, Request, Response } from 'express';
import db from '../db/pool';

const router = Router();

interface Sticker {
  id: number;
  team: string;
  number: number;
  code: string;
  owned: boolean;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { owned } = req.query;

    if (owned !== undefined) {
      const ownedValue = String(owned === 'true' ? 1 : 0);
      const result = await db.execute('SELECT * FROM stickers WHERE owned = ?', [ownedValue]);

      const stickers = result.rows.map(row => ({
        id: row.id as number,
        team: row.team as string,
        number: row.number as number,
        code: row.code as string,
        owned: (row.owned as number) === 1,
      }));

      return res.json(stickers);
    }

    const result = await db.execute('SELECT * FROM stickers');

    const stickers = result.rows.map(row => ({
      id: row.id as number,
      team: row.team as string,
      number: row.number as number,
      code: row.code as string,
      owned: (row.owned as number) === 1,
    }));

    res.json(stickers);
  } catch (err) {
    console.error('Error fetching stickers:', err);
    res.status(500).json({ error: 'Failed to fetch stickers' });
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const result = await db.execute('SELECT * FROM stickers WHERE code = ?', [String(code)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    const row = result.rows[0];
    const sticker = {
      id: row.id as number,
      team: row.team as string,
      number: row.number as number,
      code: row.code as string,
      owned: (row.owned as number) === 1,
    };

    res.json(sticker);
  } catch (err) {
    console.error('Error fetching sticker:', err);
    res.status(500).json({ error: 'Failed to fetch sticker' });
  }
});

router.patch('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { owned } = req.body;

    if (typeof owned !== 'boolean') {
      return res.status(400).json({ error: 'Invalid owned value' });
    }

    const ownedValue = String(owned ? 1 : 0);
    const codeStr = String(code);
    await db.execute(
      'UPDATE stickers SET owned = ?, updated_at = CURRENT_TIMESTAMP WHERE code = ?',
      [ownedValue, codeStr]
    );

    const result = await db.execute('SELECT * FROM stickers WHERE code = ?', [codeStr]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    const row = result.rows[0];
    const sticker = {
      id: row.id as number,
      team: row.team as string,
      number: row.number as number,
      code: row.code as string,
      owned: (row.owned as number) === 1,
    };

    res.json(sticker);
  } catch (err) {
    console.error('Error updating sticker:', err);
    res.status(500).json({ error: 'Failed to update sticker' });
  }
});

export default router;
