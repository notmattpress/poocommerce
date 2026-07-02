---
name: poocommerce-local-env
description: Set up, start, stop, restart, verify, and troubleshoot the PooCommerce Core local development environment with wp-env and asset build watchers. Use when Codex is asked to run PooCommerce locally, prepare wp-env, watch PooCommerce builds, choose between full and targeted build/watch commands, diagnose localhost:8888, or explain local environment setup commands.
---

# PooCommerce Local Environment

## Overview

Use this skill to get PooCommerce Core running locally without re-reading `plugins/poocommerce/README.md` and `.wp-env.json`.

Prefer short root scripts when present. Fall back to filtered package commands if the aliases are not available.

## Process Ownership

Use this ownership model when deciding whether to run a command or tell the user what to run:

- Run setup checks, dependency installs, one-shot builds, and `wp-env` start/stop commands from the agent when useful for the task. These commands should complete and return control.
- Treat `watch:*` commands as user-owned long-running processes. Tell the user to run the relevant watcher in a separate terminal unless a short, temporary watcher session is explicitly needed for active verification.
- Reuse an already-running environment when possible.
- Stop or clean up any agent-owned long-running session before finishing.

## Quick Commands

Run these from the repository root:

```bash
# Start the wp-env development environment at http://localhost:8888/.
pnpm wc:env

# Stop or restart wp-env.
pnpm wc:env:stop
pnpm wc:env:restart

# Watch all PooCommerce Core build outputs.
pnpm wc:watch

# Watch targeted build outputs.
pnpm wc:watch:admin
pnpm wc:watch:blocks
pnpm wc:watch:classic-assets

# Build all or targeted outputs once.
pnpm wc:build
pnpm wc:build:admin
pnpm wc:build:blocks
pnpm wc:build:classic-assets
```

`pnpm wc:env:restart` destroys and recreates the wp-env containers, so use it only when a clean restart is intended.

Fallback commands from the PooCommerce package:

```bash
pnpm --filter='@poocommerce/plugin-poocommerce' env:dev
pnpm --filter='@poocommerce/plugin-poocommerce' env:stop
pnpm --filter='@poocommerce/plugin-poocommerce' env:restart
pnpm --filter='@poocommerce/plugin-poocommerce' build
pnpm --filter='@poocommerce/plugin-poocommerce' watch:build
pnpm --filter='@poocommerce/plugin-poocommerce' watch:build:admin
pnpm --filter='@poocommerce/plugin-poocommerce' watch:build:blocks
pnpm --filter='@poocommerce/plugin-poocommerce' watch:build:classic-assets
```

From `plugins/poocommerce/`, run the package scripts directly, for example `pnpm env:dev` or `pnpm watch:build`.

## Setup Workflow

1. Check prerequisites when setup fails or when the user asks for first-time setup:

   ```bash
   node --version
   pnpm --version
   php --version
   composer --version
   docker --version
   docker info
   ```

2. Install dependencies from the repository root only when dependencies are missing or stale:

   ```bash
   pnpm install
   ```

3. Start the environment:

   ```bash
   pnpm wc:env
   ```

4. Tell the user to start a watcher in a separate terminal if frontend or asset changes need live rebuilds:

   ```bash
   pnpm wc:watch
   ```

Recommend targeted watchers for focused work to reduce noise and startup time:

- Admin client: `pnpm wc:watch:admin`
- Blocks client: `pnpm wc:watch:blocks`
- Classic assets: `pnpm wc:watch:classic-assets`

## Environment Details

- Development URL: `http://localhost:8888/`
- Test environment port: `8086`
- wp-env config: `plugins/poocommerce/.wp-env.json`
- wp-env PHP version: `8.1`
- PooCommerce package: `@poocommerce/plugin-poocommerce`
- Source README: `plugins/poocommerce/README.md`

## Verification

After starting `wp-env`, verify the site responds:

```bash
curl -I http://localhost:8888/
```

For browser-based verification, open `http://localhost:8888/` with the Browser plugin when the user asks to inspect or test the local site.

## Troubleshooting

- If `docker info` fails, ask the user to start Docker Desktop and retry.
- If `pnpm wc:env` fails after dependency changes, run `pnpm install`, then retry.
- If `wp-env` containers look stale, run `pnpm wc:env:restart` only after confirming a destructive environment reset is acceptable.
- If assets do not update, confirm the relevant watcher is running and use a targeted watcher for the changed area.
- If the user only needs PHP unit tests, prefer the test commands from `poocommerce-dev-cycle`; do not start a full browser workflow unless needed.
