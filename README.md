# Panini 2026 Album Manager 🏆

Personal web app for managing your Panini World Cup 2026 sticker collection with OCR scanning.

## Project Structure

```
Gestor de Álbum Panini Mundial 2026/
├── frontend/           # React + TypeScript + Tailwind UI
├── backend/            # Node.js + Express API
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Database Setup

**Option A: Local SQLite (recommended for development)**

No setup needed! SQLite will create a local `panini.db` file automatically.

**Option B: Turso (cloud-hosted SQLite)**

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database: `turso db create panini-album`
3. Get your connection string: `turso db show panini-album`
4. Get your auth token: `turso auth tokens create`

### 2. Configure Environment

Update `backend/.env`:

```
# For local SQLite
DATABASE_URL=file:panini.db
TURSO_AUTH_TOKEN=

# OR for Turso (replace with your values)
DATABASE_URL=libsql://[db-name]-[user].turso.io
TURSO_AUTH_TOKEN=your_auth_token_here

PORT=3001
NODE_ENV=development
```

### 3. Prepare Your Sticker Data

Create a file `backend/stickers.json` with your sticker data in this format:

```json
[
  { "team": "BRA", "number": 1, "code": "BRA 1" },
  { "team": "BRA", "number": 2, "code": "BRA 2" },
  { "team": "ARG", "number": 1, "code": "ARG 1" },
  ...
]
```

### 4. Seed the Database

Run the seed script to populate your stickers:

```bash
cd backend
npm run seed
```

This will:
- Create the `stickers` table (if it doesn't exist)
- Clear any existing data
- Insert all stickers from `stickers.json`

### 5. Start the Backend

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:3001`

### 6. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173` (or similar)

## Features

✅ **Dashboard** - View collection statistics  
✅ **Scanner** - Scan sticker codes with camera or upload photos  
✅ **OCR** - Automatic code extraction (BRA 11, ARG 5, etc.)  
✅ **List** - Browse, search, and filter stickers  
✅ **Toggle** - Mark stickers as owned/missing  
✅ **SQLite/Turso** - Works locally or in the cloud  

## API Endpoints

### Stickers
- `GET /stickers` - Get all stickers
- `GET /stickers/:code` - Get single sticker by code
- `PATCH /stickers/:code` - Update owned status (body: `{ owned: boolean }`)

### Stats
- `GET /stats` - Get collection stats (total, owned, missing, percentage)

### Health
- `GET /health` - API health check

## Next Steps

1. ✅ Frontend scaffold complete
2. ✅ Backend scaffold complete (now with SQLite/Turso!)
3. ⏳ **Provide sticker data** (JSON format)
4. ⏳ Seed the database
5. ⏳ Test the full flow end-to-end

## Environment Variables

### Backend (.env)
```
# Local SQLite
DATABASE_URL=file:panini.db

# OR Turso cloud
DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token

PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Tesseract.js (OCR)

**Backend:**
- Node.js + Express
- SQLite / Turso (@libsql/client)
- TypeScript
- Nodemon (dev)

## Database

This project uses SQLite with LibSQL client, which supports:
- **Local development** via SQLite file (`file:panini.db`)
- **Cloud hosting** via Turso (distributed SQLite at the edge)

No PostgreSQL needed! Switch between local and cloud without changing code.

## Notes

- Camera access requires HTTPS in production
- OCR works best with clear, straight images of sticker codes
- Database indexes on `code` and `team` for fast lookups
- SQLite has excellent compatibility with Turso for easy deployment
