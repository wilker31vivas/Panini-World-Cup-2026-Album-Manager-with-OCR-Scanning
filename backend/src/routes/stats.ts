import { Router, Request, Response } from 'express';
import db from '../db/pool';

const router = Router();

interface Stats {
  total: number;
  owned: number;
  missing: number;
  percentage: number;
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN owned = 1 THEN 1 ELSE 0 END) as owned,
        SUM(CASE WHEN owned = 0 THEN 1 ELSE 0 END) as missing
      FROM stickers
    `);

    const row = result.rows[0];
    const total = (row.total as number) || 0;
    const owned = (row.owned as number) || 0;
    const missing = (row.missing as number) || 0;

    const stats: Stats = {
      total,
      owned,
      missing,
      percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
