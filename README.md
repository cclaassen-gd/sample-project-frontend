# Task Board Frontend

React + Vite Kanban SPA. **Standalone project** with its own Rosetta instance.

## Rosetta (this repo)

- Cursor standalone plugin at `.cursor/` (v3.1.13)
- Workspace registry: `gain.json`
- Context docs: `docs/CONTEXT.md`, `docs/ARCHITECTURE.md`

Open this folder as its own Cursor workspace so Rosetta loads from this `.cursor/` only.

## Quick start

Requires a running Task Board API (configure `VITE_API_URL`).

```bash
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`  
Default API: `http://localhost:3000` (`VITE_API_URL`)

## Features

- Project picker
- Kanban columns: To Do / In Progress / In Review / Testing / Done
- Create issues, move status, issue detail drawer with comments
