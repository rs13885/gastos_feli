# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gastos Feli is a shared expenses tracking app — a React + Express replacement for a Google Sheets workflow. It tracks monthly expenses with proportional cost-sharing between two people (based on a configurable percentage).

## Development Commands

### Server (Node.js + Express + SQLite)
```bash
cd server
npm install
npm run dev      # node --watch (auto-restarts on changes)
npm start        # production
node seed.js     # seed DB with initial data
```
Server runs on `http://localhost:3000`.

### Client (React + Vite + Tailwind)
```bash
cd client
npm install
npm run dev      # Vite dev server
npm run build    # production build
npm run lint     # ESLint
```
Client runs on `http://localhost:5173`.

### Production (Docker)
```bash
docker-compose up -d --build
```
Caddy handles HTTPS at `https://gastosfeli.marrau.ar`, reverse-proxying to the Nginx-served client container, which in turn calls the server container.

## Architecture

### Data Flow
`App.jsx` is the single source of truth for state: it owns `expenses` (array), `currentDate` (the selected month), and all API calls. It passes data and handlers down to `Home` and `Reports` as props.

- **Month navigation** lives in the header in `App.jsx` — changing it triggers a refetch.
- **CRUD** is handled in `App.jsx` (`handleSaveExpense`, `handleDeleteExpense`, `handleCopyMonth`, `handleClearMonth`), which call the REST API, then re-fetch.
- **Home page** manages form visibility/editing state locally; it delegates save/delete up to `App.jsx` via props.
- **Reports page** receives `expenses` from `App.jsx` for the current month and independently fetches all history for aggregate stats.

### API (`/expenses`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/expenses?month=&year=` | List expenses for a month |
| GET | `/expenses` | All expenses (used by Reports for history) |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete single expense |
| POST | `/expenses/copy` | Copy all expenses from one month to another |
| DELETE | `/expenses/month?month=&year=` | Clear all expenses for a month |

### Key Domain Logic
- Each expense has `amount`, `percentage` (default 0.5 = 50%), and `proportional` (= `amount × percentage`, rounded to 2 decimal places).
- `proportional` is always computed server-side (never trust client calculation) and stored in the DB.
- The `roundToTwo` helper in `server/src/routes/expenses.js` must be applied to both `amount` and `proportional` on create, update, and copy.

### Environment Variable
The client reads `VITE_API_URL` to point at the backend. Falls back to `http://localhost:3000`. In production, set this in the client's Dockerfile build args or environment.

### Database
SQLite file at `expenses.db` in the project root, mounted as a Docker volume. Sequelize with `{ alter: true }` syncs schema on startup — safe for additive changes but be careful with destructive column changes.
