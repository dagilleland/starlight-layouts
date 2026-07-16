---
title: "Building: full-width layout"
description: Overriding TwoColumnContent so specific pages drop the right-hand table of contents and use the full available width.
---

The **full-width** layout keeps the left navigation sidebar but drops the
right-hand table-of-contents column, letting the main content pane use all
the remaining horizontal space. It's a good fit for wide diagrams, tables,
or reference pages where a floating TOC gets in the way.

See it live: [`/demos/full-width/`](/starlight-layouts/demos/full-width/).

## Why `TwoColumnContent`

Looking at Starlight's default `Page` composition, the right-hand column
comes from `TwoColumnContent`, not `PageFrame`:

```
PageFrame
├─ Header          (slot="header")
├─ Sidebar         (slot="sidebar", left nav)
└─ TwoColumnContent
   ├─ PageSidebar  (slot="right-sidebar", the TOC column)
   └─ <main>        (page content)
```

`TwoColumnContent` is the component responsible for laying out its two
children side by side, so it's the one to override to remove that second
column.

## The override

```astro title="apps/site/src/components/overrides/TwoColumnContent.astro"
---
import Default from '@astrojs/starlight/components/TwoColumnContent.astro';
import { getLayout } from '../../layouts.config';

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

`getLayout()` looks up the active `pageLayout` value in a small registry
assembled from every installed `@dagilleland/layout-*` package —
[Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) covers
that registry in full. For now, what matters is `wide`: it's a flag three
different layout packages set (`full-width`, `minimal`, and `dashboard`),
all wanting the right column gone — the [minimal layout](/starlight-layouts/tutorial/minimal-layout/)
goes a step further and also removes the left sidebar.

Note that when `layout?.wide` is true, the `right-sidebar` slot content
Starlight passes in (the actual `PageSidebar`/table of contents) is simply
never rendered — it's still computed upstream, just discarded here. That's
fine for a demo site; on a larger project you'd weigh whether skipping the
computation entirely (further upstream) is worth the complexity.

## The width cap this alone doesn't remove

Widening `TwoColumnContent`'s main pane isn't the whole story. Starlight
separately wraps page content in `ContentPanel`, which caps width at
`--sl-content-width` (45rem on this site, since a sidebar is always
configured) regardless of how wide its parent is — so without a second
override, this page's content would still sit in a 45rem column with empty
space to its right where the TOC used to be.

This project also overrides `ContentPanel`, checking the same `wide` flag
as `TwoColumnContent` above, so `full-width` pages actually use the width
they reclaim. The [dashboard layout tutorial](/starlight-layouts/tutorial/dashboard-layout/)
walks through that override in full — it's introduced there because a
widget grid makes the cap's effect obvious, but it applies here too.

## Wiring it up

The dispatcher above is registered once in `astro.config.mjs`, alongside
the other overrides:

```js title="apps/site/astro.config.mjs"
starlight({
  components: {
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
    // ...
  },
});
```

`full-width` itself, though, lives in its own package —
`packages/layout-full-width/` — since `wide` is the *only* thing it needs,
it's the simplest of the four:

```ts title="packages/layout-full-width/layout.meta.ts"
export const fullWidthMeta = {
  id: 'full-width',
  wide: true,
} as const;
```

And used from a page:

```md title="apps/site/src/content/docs/demos/full-width.md"
---
title: Full-width layout
pageLayout: full-width
---
```

Every other page — including this one — has no `pageLayout` frontmatter,
so `getLayout()` returns `undefined` and both dispatchers fall straight
through to `<Default>`, rendering exactly as stock Starlight would.
