# Todo App

Today screen (MagicPath design) with React + TypeScript (FSD) and Go + SQLite (clean architecture).

## Structure

- `apps/web` — Vite + React + TypeScript + Tailwind v4 (`:5173`)
- `apps/api` — Go API (`:8080`)
- `data/todo.db` — SQLite database (gitignored, created on API start)

## Setup

```bash
npm install
```

## Run

Terminal 1 (API):

```bash
npm run dev:api
# or: go -C apps/api run ./cmd/api
```

Terminal 2 (Web):

```bash
npm run dev:web
```

Open http://localhost:5173 — Vite proxies `/api` to the Go server.

## Build / Verify

```bash
npm run build:web
go -C apps/api vet ./...
go -C apps/api test ./...
```
