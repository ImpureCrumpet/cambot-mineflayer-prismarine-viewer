# Cambot (Viewer Edition) — AI Context & Working Guide

This file bootstraps AI context for a new workspace/fork. It summarizes project intent, key terminology, conventions, and guardrails so future conversations start productive and consistent.

## Project overview
- **Edition**: Viewer Edition — Mineflayer bot with Prismarine Viewer for a live web view
- **Purpose**: Cinematic “camera” bot that follows players/entities and switches shots automatically
- **Tech stack**: Node 22+, Mineflayer, mineflayer-pathfinder, Prismarine Viewer, Keytar, Canvas
- **Ports**: Minecraft server default `25565` (assumed reachable), Viewer `3007`
- **Repo**: `cambot-mineflayer-prismarine-viewer`

## Editions and scope
- **Viewer Edition (this repo)**: Includes Prismarine Viewer. Can be disabled via env.
- **Headless Edition (fork)**: No viewer dependency. Same bot logic; CLI/server-only.
  - Suggested repo: `cambot-mineflayer-headless` or `cambot-core`
  - Shared code: camera logic, auth, logging, tests
  - Viewer-specific pieces to omit in headless: `viewer.js`, viewer wiring, canvas prerequisites

## Commands
- Start: `node cameraBot.js`
- Setup (macOS): `npm run setup:macos -- --email "you@example.com"`
- Verify: `npm run verify`
- Tests (viewer off): `CAMBOT_ENABLE_VIEWER=false npm test`
- Auth prompt/reset: `npm run auth:prompt` / `npm run auth:reset`

## Environment variables
- `CAMBOT_ENABLE_VIEWER`: `false` disables Prismarine Viewer (default: enabled)
- `CAMBOT_VIEW_DISTANCE`: server chunk distance (default: `6`)
- `CAMBOT_LOG_LEVEL`: `error|warn|info|debug` (default: `info`)
- `CAMBOT_LOG_MAX_BYTES`: rotate size (default: `5242880`)
- `CAMBOT_LOG_MAX_AGE_MS`: rotate age (default: `900000`)
- `CAMBOT_GOAL_LOG_THROTTLE_MS`: throttle move logs (default: `2000`)
- `CAMBOT_TP_*`: teleport dwell/poll/timeout/settings

## Credentials and auth
- Uses Microsoft Device Code flow (no password in code)
- macOS Keychain item: service `MineflayerBot`, account `bot-email`, password = your MS email
- First run prints login URL + code; tokens cached by Mineflayer’s auth provider
- Ensure Minecraft Java profile exists by launching once via official launcher

## Viewer
- Library: Prismarine Viewer
- Port: `3007` → open `http://<host>:3007`
- Optional: disable via `CAMBOT_ENABLE_VIEWER=false`

## Chat commands (in-game)
- Entry: `cambot <setting> <value>`
- Examples:
  - `cambot entitySearchRadius 120`
  - `cambot includeHostileMobs false`
  - `cambot targetMix player_focused`
  - `cambot viewModeMix circle`
  - `cambot circleSpeed 0.15`
  - `cambot circleRadius 8`
  - `cambot switchInterval 5`
- Auth: `cambot reauth` (clears launcher auth cache and exits)
- Verbose/logging: `cambot verbose`, `cambot verbose on|off`, `cambot loglevel error|warn|info|debug`

## Repository structure
- `cameraBot.js`: main bot entry/lifecycle
- `cameraManager.js`: camera behaviors, target selection, movement goals
- `viewer.js`: Prismarine Viewer bootstrap (Viewer Edition only)
- `logger.js`: structured logging (JSON lines); logs in `logs/session-<timestamp>.log`
- `runTests.js`: smoke/integration checks
- `scripts/`: env setup and auth helpers
- `ref/`: docs, working notes, and this context file

## Logging
- JSONL logs, rotation by size/time
- Defaults emphasize lifecycle at `debug`, movement goals at `info` (throttled)

## Dependencies
- Mineflayer, mineflayer-pathfinder, Prismarine Viewer, Keytar, Canvas
- Version bridging (server optional): ViaFabric/ViaBackwards
- Security overrides via `npm overrides` for transitive deps (axios, xboxlive-auth, minecraft-data)

## Coding guidelines (for future AI work)
- Prefer clear, verbose names; avoid cryptic abbreviations
- Add early-return guards; keep nesting shallow
- Catch errors with meaningful handling only; avoid swallowing
- Document non-obvious logic with short “why” comments or docstrings
- Maintain existing formatting; do not reformat unrelated code
- Avoid TODOs—implement where feasible
- Keep public API signatures explicit; avoid `any`

## PR/commit guidance
- Atomic commits with descriptive messages (e.g., `feat(camera): add circle view mode`)
- Update README when user-facing behavior or setup changes
- Run tests with viewer disabled before pushing CI-critical changes

## Headless fork checklist (when creating)
- Remove `viewer.js` and viewer wiring in `cameraBot.js`
- Drop canvas/prismarine-viewer setup in scripts (or behind flag)
- Keep auth, cameraManager, logging, tests (adjust tests to run headless)
- README: title as “Cambot (Headless Edition)” with clear differentiation from Viewer Edition
- Package name suggestion: `cambot-mineflayer-headless` or `cambot-core`

## Conversation quickstart (paste into new AI session)
- This workspace is Cambot Viewer Edition. Viewer can be toggled via `CAMBOT_ENABLE_VIEWER`.
- Primary objectives:
  1) Maintain camera behaviors and chat controls
  2) Keep auth via Keychain device-code flow
  3) Preserve logs and throttling
- Non-goals: Adding GUI beyond Prismarine Viewer; platform-specific hacks outside macOS setup script
- When editing, follow Coding guidelines (above) and confirm tests pass with viewer disabled

## Known ports/assumptions
- Minecraft server reachable at `localhost:25565` unless configured differently
- Viewer at `http://<host>:3007`

## Contact/ownership
- Organization/User: `ImpureCrumpet`
- Repo: `cambot-mineflayer-prismarine-viewer`
