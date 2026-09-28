# ARCHITECTURE — Task Board Frontend

## Style

Single-page React app. Local component state; no global store in v1.

```
Browser → React (Vite) → fetch → External Task Board REST API
```

## Modules

| Area | Path | Responsibility |
|------|------|----------------|
| Shell / board | `src/App.tsx` | Layout, columns, composer, drawer |
| API client | `src/api.ts` | Typed REST helpers |
| Styles | `src/App.css`, `src/index.css` | Board UI |

## External API contract (consumer)

Configured by `VITE_API_URL` (default `http://localhost:3000`).

Expected endpoints:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:id/board`
- `POST /api/projects/:id/issues`
- `PATCH /api/issues/:id/status`
- `GET /api/issues/:id`
- `POST /api/issues/:id/comments`

This repo does not own the API implementation.
