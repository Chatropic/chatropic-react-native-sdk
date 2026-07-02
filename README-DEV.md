# Chatropic React Native SDK Developer Guide

This file is for Chatropic SDK maintainers. It is intentionally excluded from git by the root `.gitignore`.

## Local Setup

Install SDK dependencies:

```bash
cd sdk/react-native
npm ci
```

Run the local API:

```bash
cd customer-agent
python -m uvicorn main:app --reload --port 8000
```

The published SDK defaults to the configured production API host. For local SDK development, pass a local `developmentAgentUrl` into `resolveChatropicEnvironment` when calling lower-level clients, or temporarily configure `src/config/generated.ts` in a local-only build before running an emulator app:

```ts
export const CHATROPIC_GENERATED_PRODUCTION_AGENT_URL = "http://localhost:8000";
```

For physical devices during SDK development, use a local build configured with your machine's LAN API URL in `src/config/generated.ts` before running the app:

```ts
export const CHATROPIC_GENERATED_PRODUCTION_AGENT_URL = "http://YOUR_LAN_IP:8000";
```

## Creating Keys Locally

Sign in locally and keep the returned token:

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"sdk-dev@example.com","password":"Password1!","first_name":"SDK","last_name":"Dev"}'
```

Use the response `token` as `X-Session-Token` in the following examples.

Create a secret/server key:

```bash
curl -X POST http://localhost:8000/tenants/default/api-keys \
  -H "Content-Type: application/json" \
  -H "X-Session-Token: YOUR_SESSION_TOKEN" \
  -H "X-Tenant-Id: default" \
  -d '{"name":"Local server key"}'
```

Create a mobile publishable key:

```bash
curl -X POST http://localhost:8000/tenants/default/api-keys \
  -H "Content-Type: application/json" \
  -H "X-Session-Token: YOUR_SESSION_TOKEN" \
  -H "X-Tenant-Id: default" \
  -d '{"name":"Local mobile key","key_type":"publishable"}'
```

Publishable keys start with `cpk_live_`. They resolve the tenant server-side and are safe to use in mobile apps because they are scoped to widget runtime calls.

Create a sandbox widget key for integrator testing:

```bash
curl -X POST http://localhost:8000/tenants/default/api-keys \
  -H "Content-Type: application/json" \
  -H "X-Session-Token: YOUR_SESSION_TOKEN" \
  -H "X-Tenant-Id: default" \
  -d '{"name":"Sandbox widget key","key_type":"sandbox"}'
```

Sandbox keys start with `cpk_test_` and are limited to 2 unique conversations. Revoking/deleting the sandbox key and creating a new one starts the count over.

## CI Checks

Run the same checks as the release workflow:

```bash
cd sdk/react-native
npm run typecheck
npm run build
npm pack --dry-run
```

If local npm cache ownership is broken, use a temporary cache:

```bash
NPM_CONFIG_CACHE=/private/tmp/chatropic-npm-cache npm pack --dry-run
```

## Publishing

Publishing is handled by `.github/workflows/publish-react-native-sdk.yml`.

1. Publish a GitHub Release with the desired semver tag, for example `v0.1.1`.
2. The workflow writes that tag version into `sdk/react-native/package.json` and `package-lock.json` in the CI workspace.
3. The workflow installs dependencies, typechecks, builds, previews the npm package, and publishes with provenance.

Repository secret required:

- `NPM_TOKEN`: npm automation token with publish access for `@chatropic/react-native`.
- `CHATROPIC_SDK_PRODUCTION_AGENT_URL`: production agent/API base URL bundled into the published SDK.

## Release Workflow

The workflow triggers only on:

```yaml
release:
  types: [published]
```

It publishes from `sdk/react-native` using:

```bash
npm publish --access public --provenance
```

The published npm version comes from the GitHub Release tag. Tags may include a leading `v`; `v0.1.1` publishes `0.1.1`.

Before install/build, the workflow writes `src/config/generated.ts` from `CHATROPIC_SDK_PRODUCTION_AGENT_URL`. Integrators should not configure an API host; the published SDK already contains the production host.

## Internal Notes

- Do not put CI, npm token, release, or internal backend details in public `README.md`.
- Public docs should use `publishableKey`, not `tenantId`.
- Keep database migrations non-destructive. Add columns and compatible read paths before removing old behavior.
