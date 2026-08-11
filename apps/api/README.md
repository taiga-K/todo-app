# API

Go + SQLite todo API for the Today screen.

## Run

From the repository root:

```bash
go -C apps/api run ./cmd/api
```

Optional env:

- `SQLITE_DATABASE_PATH` — absolute path to the SQLite file (default: `<repo>/data/todo.db`)
- `PORT` — listen port without colon (default: `8080`)

## Endpoints

- `GET /healthz`
- `GET /api/tasks?date=YYYY-MM-DD`
- `POST /api/tasks` — body `{ "title", "details?", "time?", "dueDate" }`
- `PATCH /api/tasks/{id}` — body `{ "title?", "details?", "time?", "done?" }`
