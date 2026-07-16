---
title: "Building: dashboard layout"
description: "A close look at the ContentPanel override that removes Starlight's content-width cap, using a pageLayout: dashboard widget grid to show why it's needed."
---

The **dashboard** layout keeps the left navigation sidebar (so a dashboard
stays part of the docs tree, reachable like any other page) and drops the
right-hand table of contents — the same `wide: true` flag set by
[full-width](/starlight-layouts/tutorial/full-width-layout/) and
[minimal](/starlight-layouts/tutorial/minimal-layout/). What's actually new here isn't an
override exclusive to dashboards — it's a width cap that every `wide`
layout needed removed, but that only becomes obvious once there's a widget
grid trying to use the space.

See it live: [`/demos/dashboard/`](/starlight-layouts/demos/dashboard/).

## The width cap nothing else touched

Every layout built so far assumed that once the right TOC column was gone,
the main content pane's `width: 100%` (from the
[`TwoColumnContent` override](/starlight-layouts/tutorial/full-width-layout/)) was the end of
the story. It isn't. Starlight wraps page content — twice, once for the
title and once for the body — in `ContentPanel`, and `ContentPanel` applies
its own cap regardless of how wide its parent is:

```astro title="@astrojs/starlight/components/ContentPanel.astro (default)"
<div class="content-panel">
  <div class="sl-container"><slot /></div>
</div>

<style>
  .sl-container {
    max-width: var(--sl-content-width); /* 45rem on this site — a sidebar is always configured */
  }
</style>
```

That cap is the right call for paragraphs of documentation — long text
lines are hard to read — but wrong for `full-width`, `minimal`, and
`dashboard` pages, all of which exist specifically to reclaim width from
the dropped right column. Without also overriding `ContentPanel`, that
reclaimed width just sits empty; a page of prose might not make that
obvious, but a grid of stat tiles trying to spread across the available
space absolutely does.

## The override

```astro title="apps/site/src/components/overrides/ContentPanel.astro"
---
import Default from '@astrojs/starlight/components/ContentPanel.astro';
import { getLayout } from '../../layouts.config';

const { entry } = Astro.locals.starlightRoute;
const layout = getLayout(entry.data.pageLayout);
---

{layout?.wide ? (
  <div class="content-panel content-panel--uncapped">
    <div class="uncapped-container">
      <slot />
    </div>
  </div>
) : (
  <Default><slot /></Default>
)}

<style>
  @layer starlight.core {
    .content-panel--uncapped {
      padding: 1.5rem var(--sl-content-pad-x);
    }
    .uncapped-container {
      max-width: none;
    }
  }
</style>
```

Same `layout?.wide` check as [`TwoColumnContent`](/starlight-layouts/tutorial/full-width-layout/),
via the same registry. Registered in `astro.config.mjs` alongside the
others:

```js title="apps/site/astro.config.mjs"
starlight({
  components: {
    ContentPanel: './src/components/overrides/ContentPanel.astro',
    // ...
  },
});
```

Because `Page.astro` renders `ContentPanel` twice per page (once around the
title, once around the body), this override runs twice on every affected
page — both times dropping the cap, which is fine since the title row
benefits from the extra width too.

## Widgets, not prose

A wide container is only useful once there's something built for it.
`DashboardGrid.astro` and `Widget.astro` — both part of the
`layout-dashboard` package, not Starlight overrides, just ordinary
components — are the pieces the dashboard layout is meant to be filled
with, and the reason this override is introduced here rather than back in
the full-width tutorial:

```astro title="Using the grid + widget components in a dashboard page"
import { DashboardGrid, Widget } from '@dagilleland/layout-dashboard';

<DashboardGrid>
  <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
  <Widget title="Error rate" value="0.8%" trend="down" delta="0.3pt vs last week" />
</DashboardGrid>
```

Unlike `PageFrame` or `PageSidebarExtra` in the other layout packages,
these two aren't referenced by any dispatcher at all — nothing in
`apps/site/src/layouts.config.ts` knows they exist. They're exported from
`packages/layout-dashboard/index.ts` purely for *content* pages to import
directly, the same way you'd import any component from any npm package.

`DashboardGrid` is a responsive CSS grid (via Tailwind), and `Widget` is a
single stat tile — both are plain Astro components styled with Tailwind,
following the same "net-new UI reaches for Tailwind" convention introduced
in the [aside layout](/starlight-layouts/tutorial/aside-layout/) tutorial. Deciding what
actually belongs inside a widget — and how many to put on one page — is a
content question, not a component-override one, and gets its own page:
[Filling a dashboard](/starlight-layouts/guides/dashboard-widgets/) under **Guides**.

## Set on a page

```md title="apps/site/src/content/docs/demos/dashboard.mdx"
---
title: Dashboard layout
pageLayout: dashboard
---
```

This demo page is the one place on this site where the field's name
actually matters: it's an `.mdx` file (needed to import `DashboardGrid`
and `Widget` as components), and `.mdx` files are exactly where a field
named `layout` would collide with `@astrojs/mdx`'s own reserved frontmatter
key — see the [note in the previous tutorial page](/starlight-layouts/tutorial/conditional-defaults/)
for what that collision looks like when it fails.

Everything else — headings, code blocks, the left sidebar — stays exactly
as Starlight would render it. `TwoColumnContent` (right column) and
`ContentPanel` (width cap) both check `layout?.wide` for this layout, same
as they do for full-width and minimal; only the widget components in the
page body are unique to dashboard pages.
