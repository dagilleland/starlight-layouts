---
title: Install all four layouts via plugin
description: Install and wire up all four layouts in one step with @dagilleland/starlight-plugin-layouts — a single Starlight plugin, not four separate packages you configure by hand.
---

This page installs a different kind of thing than the rest of the Install
section. [Install layouts via npm](/starlight-layouts/install/npm/), [via pnpm](/starlight-layouts/install/pnpm/),
and [manual copy](/starlight-layouts/install/manual-copy/) all install individual layout
**packages**, which you then wire up yourself on a [wire-up page](/starlight-layouts/install/wire-full-width/) —
creating override files, adding a schema field, registering everything in
`astro.config.mjs`. This page installs one **plugin** that bundles all four
layouts and does that wiring for you, from a single `plugins: [...]` line.

**Use this page if:** you want two or more of the four layouts, you're not
already overriding `PageFrame`, `TwoColumnContent`, `PageSidebar`, or
`ContentPanel` yourself (or via another plugin), and you don't need to read
or modify the override code.

**Compatibility:** works with Astro 6.4.5+ or 7.x, and Starlight 0.40.0–0.41.x —
enforced by this package's own `peerDependencies`, and confirmed by actually
building against both ends of that range, not just inferred from the
declared versions.

**Use [Install layouts via npm](/starlight-layouts/install/npm/) instead if:** you want
just one layout, already have a conflicting override, or want the code
sitting in your own project. See [Plugin or standalone layouts?](/starlight-layouts/guides/plugin-or-standalone/)
for the full decision guide.

## tl;dr

```sh
npm install @dagilleland/starlight-plugin-layouts
```

## 1. Install the package

```sh
npm install @dagilleland/starlight-plugin-layouts
```

Works the same with `pnpm add`, `yarn add`, or `bun add`. This one package
pulls in all four layout packages as its own dependencies — you don't
install them separately.

## 2. Register the plugin

```js title="astro.config.mjs"
import starlight from '@astrojs/starlight';
import starlightLayouts from '@dagilleland/starlight-plugin-layouts';

starlight({
  plugins: [starlightLayouts()],
});
```

This registers `PageFrame`, `TwoColumnContent`, `PageSidebar`, and
`ContentPanel` automatically. Don't also set any of those four directly in
your own `components:` config, or combine this with another plugin that
touches the same slots — whichever runs last wins, silently. See
[Plugin or standalone layouts?](/starlight-layouts/guides/plugin-or-standalone/) if you're not sure
whether that applies to you.

## 3. Add a frontmatter field

A Starlight plugin can't extend the content-collection schema — this step
stays manual either way, but `layoutIds` keeps it to one line instead of
retyping four layout names:

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

## 4. Import the bundled Tailwind styles

Also stays manual: Tailwind v4 only scans `@source` directives that share a
CSS module graph with wherever `tailwindcss` itself is imported, and a
plugin's `customCss` entries are a separate, disconnected graph — so this
can't be registered automatically. One `@import` covers all four layouts:

```css title="src/styles/global.css"
@import '@dagilleland/starlight-plugin-layouts/tailwind.css';
```

## 5. Use a layout on a page

```md title="src/content/docs/some-page.md"
---
title: A wide page
pageLayout: full-width
---
```

Any of the four IDs work here: `full-width`, `minimal`, `with-aside`,
`dashboard`. Pages without `pageLayout` set fall straight through to
Starlight's own default rendering.

## Learn more

- [Turning it into a Starlight plugin](/starlight-layouts/tutorial/starlight-plugin/) — how this
  plugin works internally, and why it's one plugin bundling four layouts
  rather than four independent ones.
- [Plugin or standalone layouts?](/starlight-layouts/guides/plugin-or-standalone/) — the decision
  guide for choosing between this page and the individual-package install
  methods.
