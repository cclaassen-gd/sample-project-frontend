# CONTEXT — Task Board Frontend

## Business purpose

Web SPA for a Jira-lite Kanban board. Users pick a project, view issues by status, create issues, move cards, and comment.

This repository is **frontend-only**. It owns its own Rosetta instance under `.cursor/`.

## Actors

- **Contributor** — creates issues, changes status, posts comments
- **Viewer** — browses board and issue detail

## Core behaviors

1. List projects and select one.
2. Show board columns: To Do / In Progress / In Review / Testing / Done.
3. Create issues (title, priority, optional assignee).
4. Move issue status from the card or detail view.
5. Open issue detail drawer with comments.

## Out of scope (v1)

- Auth / login UI
- Drag-and-drop (status select is enough)
- Offline mode
- Hosting or packaging the API in this repo

## Target state

- React + Vite SPA in this repo only
- Talks to an external Task Board REST API via `VITE_API_URL`
- Independent Rosetta plugin (Cursor standalone) at `.cursor/`
