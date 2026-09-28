# IMPLEMENTATION — Frontend

## 2026-09-23 — Testing column

- Board columns: To Do / In Progress / In Review / Testing / Done.
- `IssueStatus` includes backend `TESTING`; move select uses the same list.

## 2026-09-21 — Standalone Rosetta project

- Own Cursor standalone Rosetta at `.cursor/` (separate inode from backend).
- Full Rosetta workspace docs + `gain.json` (`composite: false`).
- React + Vite Kanban UI against external REST API (`VITE_API_URL`).
