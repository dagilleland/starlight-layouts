---
title: Turning the registry into a Starlight plugin
description: Packaging the layout registry from Composing layout packages as an installable Starlight plugin — what it can automate, and the two things it genuinely can't.
---

[Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) covered how this
project's four dispatcher files delegate to a small registry built from four
independent packages. Every [wire-up page](/starlight-layouts/install/wire-full-width/) in the Install
section asks a reader to recreate a version of that registry and those
dispatchers by hand, in their own project. This page asks: could a package
do that wiring itself?

## The hook that makes this possible

Starlight plugins get a `config:setup` hook that receives `updateConfig` — a
function a plugin calls to modify the site's Starlight configuration,
including the `components` option this whole tutorial has been overriding
by hand. A plugin that calls `updateConfig({ components: { ... } })`
registers an override the same way a hand-written `astro.config.mjs` does,
just from inside a package instead of the consuming project.

That's the whole mechanism. It's tempting to stop there and give each
layout package — `full-width`, `minimal`, `with-aside`, `dashboard` — its
own independent plugin, so installing one is as simple as adding one line
to `plugins: [...]`. That doesn't actually work for this family of layouts,
for a reason worth understanding before writing any code.

## Why four independent plugins would break

Starlight's plugin docs are explicit about how `updateConfig` calls combine
across plugins: *"to update nested configuration values, you must provide
the entire nested object."* Each plugin's `components` update is applied
as a whole-object replacement for whatever came before it — not merged key
by key. A later plugin's `config:setup` hook does receive the config as
already modified by earlier plugins (so it *can* read and preserve prior
values), but nothing forces it to.

That matters here specifically because `TwoColumnContent` and
`ContentPanel` aren't owned by one layout — three different layouts
(`full-width`, `minimal`, `dashboard`) all set the shared `wide` trait and
rely on those same two overrides checking it. A `starlight-plugin-minimal`
package and a `starlight-plugin-dashboard` package, each independently
calling `updateConfig({ components: { TwoColumnContent: '...' } })`, would
have the second one silently clobber the first's registration — no error,
no warning, just one layout's width override quietly stops working the
moment both plugins are installed together. `with-aside` is the one
exception: it only *adds* to `PageSidebar`, and nothing else in this family
touches that slot, so it's the only layout safe to plugin-ify in isolation.

The fix isn't a clever merge trick — it's the same fix
[Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) already
landed on for the exact same problem inside `apps/site`: one thing has to
own each slot and decide, per page, which layout's behavior applies. So
this is one plugin, bundling all four layouts, built from the same
registry pattern already covered — not four independent ones.

## The plugin package

`packages/starlight-plugin-layouts/` carries its own copy of the registry —
`layouts.meta.ts` and `layouts.config.ts` — built the same way as
`apps/site`'s versions, just importing the four layout packages by their
published names instead of workspace aliases (which, since this monorepo
names its workspace packages identically to their published names, happen
to be the exact same import specifiers either way):

```ts title="packages/starlight-plugin-layouts/layouts.config.ts"
import { fullWidthLayout } from '@dagilleland/layout-full-width';
import { minimalLayout } from '@dagilleland/layout-minimal';
import { withAsideLayout } from '@dagilleland/layout-with-aside';
import { dashboardLayout } from '@dagilleland/layout-dashboard';
import type { LayoutId } from './layouts.meta';

const layouts = [fullWidthLayout, minimalLayout, withAsideLayout, dashboardLayout];

export function getLayout(id: LayoutId | undefined) {
  return layouts.find((layout) => layout.id === id);
}
```

It also carries its own copies of the four dispatchers — identical to
`apps/site/src/components/overrides/*.astro`, just importing `getLayout`
from a sibling file instead of an app-relative path:

```astro title="packages/starlight-plugin-layouts/overrides/TwoColumnContent.astro"
---
import Default from '@astrojs/starlight/components/TwoColumnContent.astro';
import { getLayout } from '../layouts.config';

const { entry } = Astro.locals.starlightRoute;
const layout = getLayout(entry.data.pageLayout);
---

{layout?.wide ? (
  <div class="main-pane main-pane--full">
    <slot />
  </div>
) : (
  <Default>
    <slot name="right-sidebar" slot="right-sidebar" />
    <slot />
  </Default>
)}

<style>
  @layer starlight.core {
    .main-pane--full {
      isolation: isolate;
      width: 100%;
    }
  }
</style>
```

`PageFrame.astro`, `PageSidebar.astro`, and `ContentPanel.astro` follow the
same pattern — nothing new, just relocated.

The plugin itself is the thin part: a factory function returning an object
with a `name` and a `config:setup` hook, registering all four dispatchers
in one `updateConfig` call. It spreads `config.components` first, exactly
because of the collision risk covered above — this preserves any override
a consuming project (or an earlier plugin) already set for an unrelated
slot, like `Footer`, instead of wiping it out:

```ts title="packages/starlight-plugin-layouts/index.ts"
import type { StarlightPlugin } from '@astrojs/starlight/types';

export { layoutIds } from './layouts.meta';
export type { LayoutId } from './layouts.meta';

export default function starlightLayouts(): StarlightPlugin {
  return {
    name: '@dagilleland/starlight-plugin-layouts',
    hooks: {
      'config:setup'({ config, updateConfig }) {
        updateConfig({
          components: {
            ...config.components,
            PageFrame: '@dagilleland/starlight-plugin-layouts/overrides/PageFrame.astro',
            TwoColumnContent: '@dagilleland/starlight-plugin-layouts/overrides/TwoColumnContent.astro',
            PageSidebar: '@dagilleland/starlight-plugin-layouts/overrides/PageSidebar.astro',
            ContentPanel: '@dagilleland/starlight-plugin-layouts/overrides/ContentPanel.astro',
          },
        });
      },
    },
  };
}
```

Using it is one line inside `starlight()`'s own config:

```js title="astro.config.mjs"
import starlight from '@astrojs/starlight';
import starlightLayouts from '@dagilleland/starlight-plugin-layouts';

starlight({
  plugins: [starlightLayouts()],
});
```

No override files to create, no `astro.config.mjs` `components:` entries to
type out by hand — that whole section of every wire-up page in Install is
gone.

## Two things a plugin genuinely can't do

**Extend the content schema.** `pageLayout` still needs to be added to
`content.config.ts` by hand — there's no plugin hook for content collection
schemas, only for Starlight's own configuration. The plugin narrows this to
one line instead of retyping four layout names, by re-exporting the same
`layoutIds` tuple it uses internally:

```ts title="src/content.config.ts"
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { layoutIds } from '@dagilleland/starlight-plugin-layouts/meta';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          pageLayout: z.enum(layoutIds).optional(),
        }),
    }),
  }),
};
```

**Register a Tailwind content source.** This one isn't a missing feature so
much as a real Tailwind v4 constraint, and it's worth knowing the actual
mechanism rather than just the workaround. Tailwind's Vite plugin only
honors `@source` directives inside the same CSS module graph as wherever
`tailwindcss` itself gets imported — the file (or files it `@import`s) that
declares `@import 'tailwindcss/theme.css' layer(theme);` and similar.
Starlight's `customCss` array entries are each their own independent root,
disconnected from that graph, so a plugin calling
`updateConfig({ customCss: [...] })` to add a `@source`-bearing stylesheet
doesn't work — the directive is silently inert. This was confirmed by
actually building a test project both ways and diffing the compiled CSS:
the `@source`-registered utility classes (`rounded-lg`, `tracking-wide`,
and so on) were simply absent from the output when registered through
`customCss`, with no build error to flag it.

So Tailwind wiring stays a manual `@import`, same as installing the four
layout packages individually — this package just collapses it to one line
instead of four, since `@source` resolves relative to whichever file
declares it, not whichever file imports it:

```css title="src/styles/global.css"
@import '@dagilleland/starlight-plugin-layouts/tailwind.css';
```

## The workspace:* trap, if you publish something like this yourself

There's a third gotcha, separate from the plugin API's own limits above —
one only visible at publish time, learned the hard way. This package's
`package.json` lists its four dependencies using pnpm's workspace
protocol, not real version numbers:

```json title="packages/starlight-plugin-layouts/package.json (excerpt)"
{
  "dependencies": {
    "@dagilleland/layout-full-width": "workspace:*",
    "@dagilleland/layout-minimal": "workspace:*",
    "@dagilleland/layout-with-aside": "workspace:*",
    "@dagilleland/layout-dashboard": "workspace:*"
  }
}
```

`workspace:*` only means something *inside* the pnpm workspace that defines
it — it tells pnpm "link to whatever's in this monorepo, not the
registry." `pnpm publish` and `pnpm pack` know to rewrite it to each
sibling's real, currently-published version before the package leaves the
workspace. Plain `npm publish` doesn't — it has no concept of the
`workspace:` protocol at all, and ships that literal, unresolvable string
as-is.

That's exactly what happened the first time this package was published: it
went out via `npm publish`, chosen specifically because `pnpm publish`'s
interactive login flow had hung once before. The published package
installed fine inside *this* monorepo (pnpm was still resolving the
dependency from the local workspace, never touching the broken published
metadata) but broke for absolutely everyone who installed it from the
registry into their own project — bun, npm, yarn, **and pnpm**. Confirmed
directly: even `pnpm add` against the broken version, run from a plain,
non-workspace project, fails with the same
`"@dagilleland/layout-minimal@workspace:*" is in the dependencies but no
package named ... is present in the workspace` error bun reported.
`workspace:*` shipped to the registry isn't a "some package managers
understand it" problem — once it leaves its originating workspace, it's
broken for every consumer, full stop.

The fix wasn't switching back to `pnpm publish` — it's a small script,
[`publish.mjs`](https://github.com/dagilleland/starlight-layouts/blob/main/packages/starlight-plugin-layouts/publish.mjs),
that substitutes each sibling's real, currently-published version into a
copy of `package.json` immediately before running plain `npm publish`,
then restores the `workspace:*` version afterward so local monorepo
development keeps working unchanged. If you're publishing a package with
real sibling dependencies out of a monorepo, this is the thing to get
right *before* your first release, not after.

## One plugin, one owner

Because this plugin claims all four override slots for the whole family of
layouts, don't also set `PageFrame`, `TwoColumnContent`, `PageSidebar`, or
`ContentPanel` directly in your own `starlight()` config, and don't combine
it with another plugin that touches the same slots — per the merge
behavior above, whichever one runs last in `plugins: [...]` wins, silently.
If you only want one or two of the four layouts and want to avoid this
question entirely, the per-layout [wire-up pages](/starlight-layouts/install/wire-full-width/)
in the Install section remain the more surgical option — this plugin
trades that granularity for a single-line install.
