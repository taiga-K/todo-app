---
name: run
description: >-
  Start this Wasp todo-app on localhost with BROWSER=none and open the Cursor
  built-in browser only. Prefer over start-dev-server for plain local run (not
  full debug). Use when the user asks to run locally, ローカル実行, 起動して,
  動かして, 立ち上げて, start the app, bring it up, wasp start, open in
  built-in browser, no Chrome, or /run.
---

# Run (local)

Start the app on localhost from the todo-app project root. Nothing else.

## Speed rules

- **Probe first.** If `:3000` and `:3001` already return HTTP success, do not start, install, migrate, or inspect terminals — open the browser immediately.
- **One shell for cold start.** Do not run Node / env / DB / migrate checks as separate turns.
- **Wait on curl, not logs.** Do not grep Vite/`Local:` lines.
- **No Chrome.** `BROWSER=none`. Never `open`, `xdg-open`, or Chrome DevTools MCP. Do not use `.agents/skills/start-dev-server`.
- **Browser:** `cursor-ide-browser` only, `position: "active"`. Skip `browser_tabs` list.

## Fast path (prefer)

```bash
curl -sf -o /dev/null http://localhost:3000/ && curl -sf -o /dev/null http://localhost:3001/ && echo UP || echo DOWN
```

If `UP` → step **Open browser**. Done.

## Cold start

Background one command (`block_until_ms: 0`). This app is SQLite — no `wasp start db`:

```bash
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
test -d node_modules || wasp install
test -f .env.server || printf '%s\n' 'SKIP_EMAIL_VERIFICATION_IN_DEV=true' > .env.server
BROWSER=none wasp start
```

Poll until both curl checks succeed (≈1–2s interval). Only if start fails:

- Node must be `>= 24.14.1` (use `ls "$HOME/.nvm/versions/node"` if `v24.19.0` missing)
- Port busy / dead listener → kill that listener, rerun the same start command
- Pending schema → `wasp db migrate-dev --name <descriptive-name>` then restart

## Open browser

```
browser_navigate
  url: http://localhost:3000/
  position: "active"
```

If navigate fails because a tab already exists, `browser_lock` then navigate. Blank first paint once is OK (Vite optimize); one short wait + snapshot if needed. No screenshot required unless the page looks wrong.

## Report (one line each)

- Client: `http://localhost:3000/`
- Server: `http://localhost:3001/`
- Opened in the Cursor built-in browser (system Chrome was not launched)
