---
title: "Wire up: dashboard layout"
description: How to use the DashboardGrid and Widget components from @dagilleland/layout-dashboard, plus the optional full-width treatment, once the package is installed.
---

This page assumes `@dagilleland/layout-dashboard` is already installed — via [npm](/starlight-layouts/install/npm/), [pnpm](/starlight-layouts/install/pnpm/), or [a manual copy](/starlight-layouts/install/manual-copy/). What's below is identical regardless of which method you used.

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) — both components are styled entirely with Tailwind utility classes, referencing Starlight's own `--sl-color-*` custom properties so they automatically match your site's theme.

Unlike the other three layouts in this family, this package has two independent parts: the widgets, which need no wiring at all, and an optional full-width treatment, which needs the same overrides as [full-width](/starlight-layouts/install/wire-full-width/).

## The widgets: zero wiring needed

`DashboardGrid` and `Widget` aren't Starlight overrides — they're ordinary components, usable the moment they're installed. No content-schema field, no override, no `astro.config.mjs` change:

```mdx title="src/content/docs/some-page.mdx"
import { DashboardGrid, Widget } from '@dagilleland/layout-dashboard';

<DashboardGrid>
  <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
  <Widget title="Error rate" value="0.8%" trend="down" delta="0.3pt vs last week" />
</DashboardGrid>
```

Drop that into any `.mdx` page and it renders inside your page's normal content column — sidebar, table of contents, and content-width cap all unaffected. Good enough if you just want a stat grid somewhere on an otherwise ordinary page. See [Filling a dashboard](/starlight-layouts/guides/dashboard-widgets/) for content-design tips: one widget per idea, leading with the number, and more.

## The full-width treatment: same overrides as full-width

If you also want the grid to span the full page width — no right-hand table of contents, no content-width cap — that's the same `wide` mechanism [full-width](/starlight-layouts/install/wire-full-width/) uses. Follow that page's four steps unchanged, just matching `'dashboard'` instead of `'full-width'`:

### 1. Add a frontmatter field

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
          pageLayout: z.enum(['dashboard']).optional(),
        }),
    }),
  }),
};
```

### 2. Override `TwoColumnContent`

```astro title="src/components/overrides/TwoColumnContent.astro"
---
import Default from '@astrojs/starlight/components/TwoColumnContent.astro';

const { entry } = Astro.locals.starlightRoute;
const wide = entry.data.pageLayout === 'dashboard';
---

{wide ? (
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

### 3. Override `ContentPanel`

```astro title="src/components/overrides/ContentPanel.astro"
---
import Default from '@astrojs/starlight/components/ContentPanel.astro';

const { entry } = Astro.locals.starlightRoute;
const wide = entry.data.pageLayout === 'dashboard';
---

{wide ? (
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

### 4. Register both overrides

```js title="astro.config.mjs"
starlight({
  components: {
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

### 5. Use it on a page

```mdx title="src/content/docs/some-page.mdx"
---
title: A dashboard page
pageLayout: dashboard
---

import { DashboardGrid, Widget } from '@dagilleland/layout-dashboard';

<DashboardGrid>
  <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
</DashboardGrid>
```

See [Building: dashboard layout](/starlight-layouts/tutorial/dashboard-layout/) for why the width-cap override matters even once the right column is gone.
