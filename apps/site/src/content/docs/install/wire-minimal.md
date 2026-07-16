---
title: "Wire up: minimal layout"
description: The exact content-schema field and component overrides needed to use @dagilleland/layout-minimal in your own project, once it's installed.
---

This page assumes `@dagilleland/layout-minimal` is already installed — via [npm](/starlight-layouts/install/npm/), [pnpm](/starlight-layouts/install/pnpm/), or [a manual copy](/starlight-layouts/install/manual-copy/). What's below is identical regardless of which method you used.

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build). This package has no Tailwind classes of its own, so Tailwind isn't required just for this layout.

`minimal` needs two things wired up: a `PageFrame` override to render (or not render) the package's `PageFrame.astro`, and the same `wide` treatment as [full-width](/starlight-layouts/install/wire-full-width/) to also drop the right-hand table of contents.

## 1. Add a frontmatter field

```ts title="src/content.config.ts"
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          // Not `layout` — see the note on layout-full-width's wire-up page.
          pageLayout: z.enum(['minimal']).optional(),
        }),
    }),
  }),
};
```

Already have a `pageLayout` field from wiring up another layout package? Add `'minimal'` to that same `z.enum([...])` array instead of creating a second field.

## 2. Override `PageFrame`

Import `PageFrame.astro` straight from the installed package (its `package.json` exports every file, not just the main entry point) and dispatch to it:

```astro title="src/components/overrides/PageFrame.astro"
---
import Default from '@astrojs/starlight/components/PageFrame.astro';
import MinimalPageFrame from '@dagilleland/layout-minimal/PageFrame.astro';

const { entry } = Astro.locals.starlightRoute;
const minimal = entry.data.pageLayout === 'minimal';
---

{minimal ? (
  <MinimalPageFrame>
    <slot name="header" slot="header" />
    <slot />
  </MinimalPageFrame>
) : (
  <Default>
    <slot name="header" slot="header" />
    <slot name="sidebar" slot="sidebar" />
    <slot />
  </Default>
)}
```

## 3. Override `TwoColumnContent` and `ContentPanel`

Same two overrides as [full-width](/starlight-layouts/install/wire-full-width/) — copy both from steps 2 and 3 of that page, checking `entry.data.pageLayout === 'minimal'` (or `'full-width'`, if you're using both — see below). Both are necessary for the same reason: without them, the space freed up by removing the sidebars just sits empty.

If you're wiring up `minimal` alongside `full-width`, one pair of `TwoColumnContent`/`ContentPanel` overrides can serve both — check `wide` from a shared layout registry rather than one hardcoded value, the way [Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) does. For a single layout, checking one string is simpler and works fine.

## 4. Register the overrides

```js title="astro.config.mjs"
starlight({
  components: {
    PageFrame: './src/components/overrides/PageFrame.astro',
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

## 5. Use it on a page

```md title="src/content/docs/some-page.md"
---
title: A standalone page
pageLayout: minimal
---
```

See [Building: minimal layout](/starlight-layouts/tutorial/minimal-layout/) for why the override works the way it does, including a CSS-variable gotcha its `<style>` block works around.
