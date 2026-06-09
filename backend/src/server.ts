import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stickersRouter from './routes/stickers';
import statsRouter from './routes/stats';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './db/pool';

const app = express();
app.use(express.json());
app.disable("x-powered-by");

dotenv.config();
const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (!CORS_ORIGIN) {
  throw new Error('Missing required env variable: CORS_ORIGIN');
}

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: CORS_ORIGIN.includes(',')
      ? CORS_ORIGIN.split(',').map(o => o.trim())
      : CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  }),
);


// Routes
app.use('/stickers', stickersRouter);
app.use('/stats', statsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
