# Palevie v0.4 validation notes

Validation performed in the build sandbox on 2026-08-09.

## Passed

### TypeScript/TSX syntax pass
All project `.ts` / `.tsx` files (excluding generated test folders) were parsed/transpiled with the installed TypeScript compiler API.

Result:

```text
Transpiled 54 TS/TSX files; syntax-error files: 0
```

### Local import resolution
A static import check confirmed every relative and `@/` project import resolves to an existing local file.

```text
All local imports resolve.
```

### Quiz unit tests

```text
PASS  all 16 types reachable as #1
PASS  deterministic output
PASS  percentages always sum to 100
PASS  axes always within [-1, 1]
PASS  wrong answer count throws
PASS  all-warm answers land in a warm family

ALL TESTS PASSED
```

## Full build not completed in this sandbox

`npm ci --ignore-scripts` was attempted, but the sandbox's internal npm mirror returned a 404 while fetching `undici-types-6.21.0.tgz`:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/.../undici-types-6.21.0.tgz
```

Because dependencies could not be installed in this runtime, `npm run typecheck` and `npm run build` could not be truthfully completed here.

On a normal development machine, run:

```bash
npm ci
npm run typecheck
npm run test:quiz
npm run build
```

If any compiler/build error appears there, fix that concrete error without replacing the working architecture.
