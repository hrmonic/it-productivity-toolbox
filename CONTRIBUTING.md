# Contributing

Thank you for helping make IT delivery a little clearer. Small, complete improvements with a concrete user benefit are especially welcome.

## Before writing code

Read the [product scope](docs/PRD.md) and [architecture](docs/ARCHITECTURE.md). For substantial changes, open an issue explaining the situation, intended behavior, and acceptance criteria. Use fictional examples rather than confidential project content.

## Development

Use Node.js 24 and the pnpm version declared in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Run these checks before opening a pull request:

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

On Linux, `pnpm exec playwright install --with-deps chromium` also installs browser system dependencies. See [testing](docs/TESTING.md) for scope and limitations.

## Code and review expectations

- Keep business rules in feature domain modules; keep storage operations at the data boundary.
- Use strict types, validate imports, preserve record identity, and avoid silent changes to approved agreements.
- Add tests for changed behavior and relevant failure cases. Prefer behavior assertions over implementation snapshots.
- Add every UI message to the French catalog. Never translate project content automatically. Keep code, comments, commit messages, issues, and review discussion in English.
- Document changed calculations, data formats, and limitations in the same PR.
- Use semantic HTML and labelled controls. Check keyboard behavior, both themes, and a narrow viewport for UI changes.
- Do not add telemetry, external analysis, secrets, remote fonts, or background data transmission.

Use descriptive commits such as `feat(scope): explain missing effort estimates` or `fix(data): preserve references when restoring backups`. PR descriptions should explain the problem, resulting behavior, actual validation, and data compatibility.

Contributions are provided under the repository’s [Apache License 2.0](LICENSE). Be respectful, specific, and constructive in discussion.
