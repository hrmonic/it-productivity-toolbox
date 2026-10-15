# Running and deploying

## Local development

Install Node.js 24 and enable Corepack (or install the exact pnpm version from `package.json`).

```sh
git clone https://github.com/hrmonic/it-productivity-toolbox.git
cd it-productivity-toolbox
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. No `.env`, API key, database service, or account is needed. The project has its own `pnpm-workspace.yaml` to avoid accidentally joining an unrelated parent workspace.

## Production preview

```sh
pnpm build
pnpm preview
```

`vite preview` is a local verification server, not a production hosting service. The `dist/` directory is the deployable artifact. Do not open `index.html` directly using a `file:` URL.

## Static hosting

No deployment is performed by the quality-check workflow. To host the application, publish the contents of `dist/` on a static HTTPS host. Hash routing means no application-route rewrites are needed. For a host serving the app from a subdirectory, configure Vite’s `base` and use base-relative public asset paths before building. The repository’s default build targets the origin root.

Serve assets with correct MIME types and avoid caching `index.html` indefinitely. Content-hashed assets can use long-lived immutable caching. At the hosting layer, consider `X-Content-Type-Options: nosniff`, a restrictive referrer policy, an appropriate permissions policy, and a Content Security Policy compatible with the app. Radix positioning and dynamic styles may require a reviewed style policy; do not claim an untested header configuration.

Project storage is origin-specific. Changing scheme, hostname, or port creates a different browser storage scope. Tell users to export their backups before moving a deployment. Hosting does not add synchronization, accounts, encryption, or device-to-device recovery.

## Rollback and upgrades

Keep the previous static build and notify users about data-format changes. Export backups before testing an upgrade against real workspaces. Future IndexedDB schema changes require explicit upgrade handlers and migration tests; a static rollback alone does not reverse an IndexedDB migration.
