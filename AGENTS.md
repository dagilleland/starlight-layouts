## Monorepo layout

This is a pnpm workspace: the Starlight app lives in `apps/site/`, and each
custom layout is its own package under `packages/layout-*/`. Run commands
from the repo root — `pnpm run dev`, `pnpm run build`, etc. proxy to
`apps/site` via `pnpm --filter`. To target a specific package directly, use
`pnpm --filter <package-name> <command>` (e.g.
`pnpm --filter @starlight-layouts/site astro check`).

## Development

When starting the dev server, use background mode, from the repo root:

```
pnpm --filter @starlight-layouts/site exec astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs` (also via `pnpm --filter @starlight-layouts/site exec astro ...`).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
