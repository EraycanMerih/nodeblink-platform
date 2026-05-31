# Vulnerability Notes & Mitigation Plan

Summary (audit run: 2026-06-01): 5 advisories remain after safe fixes.

High-severity items:
- `bigint-buffer` (<=1.1.5) — affects `@solana/buffer-layout-utils` and `@solana/spl-token` (buffer overflow via `toBigIntLE()`). Fix available in `@solana/spl-token@0.1.8` (semver-major).
- `@solana/buffer-layout-utils` — depends on `bigint-buffer` (high).
- `@solana/spl-token` — depends on `@solana/buffer-layout-utils` (high).

Moderate-severity items:
- `postcss` (<8.5.10) — XSS via unescaped `</style>` in stringify output. `next@15.5.18` bundles `postcss@8.4.x` internally.
- `next` (<=16.3.0-canary.5) — flagged because of bundled `postcss`.

Why these are deferred:
- Upgrading `@solana/spl-token` to the recommended fixed release is a semver-major change and may require code updates to transaction/minting logic and possibly Node engine changes.
- Upgrading `next` to a version that depends on a safe `postcss` release may require Node >=20.9.0 and other runtime changes; Next is currently building and passing tests locally.

Mitigation plan (recommended):
1. Track advisories in the repo and upstream packages. Re-run `npm audit` weekly.
2. Create an `upgrade/solana-and-next` branch for staged major-upgrade work.
3. In that branch:
   - Upgrade `@solana/spl-token`, `@solana/web3.js`, and `@solana/actions` to latest compatible majors.
   - Upgrade `next` to a safer release if feasible and update Node engine as needed.
   - Run full test/build: `npm run build:next` and run any server smoke tests.
   - Fix any API/typing/runtime regressions (likely in `lib/creator-actions.ts` and related Solana helpers).
4. Deploy branch to a staging droplet (separate PM2 process or container) and run end-to-end wallet flows.
5. If staging passes, schedule a maintenance deployment window to upgrade production.

Quick commands
```
npm audit --json
npm install # after making explicit upgrades on the upgrade branch
npm run build:next
curl -sS http://localhost:8080/api/metrics
```

Notes:
- Current `next` build and the Express runtime are functioning; these advisories are upstream and require coordinated major upgrades.
- If you prefer an immediate but risky path, run `npm audit fix --force` on a feature branch and resolve breakages there (not recommended for production main branch).

Maintainer: add any PR links or notes below when you create the upgrade branch.
