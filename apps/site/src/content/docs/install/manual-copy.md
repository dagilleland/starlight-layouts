---
title: Manually copying layouts
description: How to copy a layout's files out of this repository by hand and adapt them into your own project — no pnpm dependency, full freedom to modify.
---

If you're not on pnpm (e.g.: npm, yarn, bun, etc.), or you'd rather own the code outright — modify it freely, with no git dependency quietly tracking someone else's branch — copying the files in by hand works too. It's more manual than [installing via pnpm](/starlight-layouts/install/pnpm/), but it works with any package manager, or none at all.

## What "copying a layout" actually involves

Worth knowing before you start: **not every layout is a drop-in copy.** Each package only contains its own custom piece — a component, or just metadata. The thing that actually makes a layout *do* something on a Starlight site — the override component that decides when to use it, a content-schema field, registering it in `astro.config.mjs` — lives in this project's app, not in the package. [Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) covers why that split exists in full.

In practice that means:

- **Dashboard's `DashboardGrid`/`Widget`** are usable the moment you copy them in — they're just Astro components, no wiring required. This page walks through that case fully, below.
- **The other three layouts** (full-width, minimal, with-aside) need you to also write a small override component and register it — copying the file alone leaves it inert. A dedicated wire-up page has the exact code for each layout; see the links at the bottom of this page.

## Getting the files

### Option 1: clone the repo, copy a folder

```sh
git clone https://github.com/dagilleland/starlight-layouts.git
```

Then copy whichever `packages/layout-*/` directory you want into your own project — everything you need for that layout is inside it.

### Option 2: grab individual files from GitHub, no git required

If you only want one or two files, you don't need to clone anything. Open the file on GitHub (e.g. navigate to `packages/layout-dashboard/DashboardGrid.astro` in the repo) and use the toolbar above the code, next to **Code** / **Blame**:

- Click the **download icon** (hover it and you'll see the tooltip *"Download raw file"*) to save the file directly.
- Or click **Raw** to open the plain-text version, then save it with your browser's Save Page (Ctrl+S / Cmd+S).
- Or skip the browser entirely and use the raw URL directly — every file in this repo has one at `https://raw.githubusercontent.com/dagilleland/starlight-layouts/main/<path-in-repo>`:

  ```sh
  curl -O https://raw.githubusercontent.com/dagilleland/starlight-layouts/main/packages/layout-dashboard/DashboardGrid.astro
  curl -O https://raw.githubusercontent.com/dagilleland/starlight-layouts/main/packages/layout-dashboard/Widget.astro
  ```

## Worked example: dashboard widgets

This is the layout that needs no wiring at all — a genuinely complete example, start to finish.

**Prerequisite:** a Starlight site with [Tailwind v4 set up](https://starlight.astro.build/guides/css-and-tailwind/), since both components are styled entirely with Tailwind utility classes.

1. Grab the two files using either option above, and save them into your project — say, `src/components/DashboardGrid.astro` and `src/components/Widget.astro`.
2. Import and use them in any `.mdx` page:

   ```mdx title="src/content/docs/some-page.mdx"
   import DashboardGrid from '../../components/DashboardGrid.astro';
   import Widget from '../../components/Widget.astro';

   <DashboardGrid>
     <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
     <Widget title="Error rate" value="0.8%" trend="down" delta="0.3pt vs last week" />
   </DashboardGrid>
   ```

That's it — no frontmatter field, no override, no `astro.config.mjs` change. The grid renders inside your page's normal content column. If you also want the full-width, no-table-of-contents treatment the demo page uses, that part *does* need wiring — see [Wire up: dashboard](/starlight-layouts/install/wire-dashboard/) for the two extra overrides involved.

## The other three layouts

Each needs an override component copied in alongside its layout package, plus a few lines of registration. A dedicated page covers exactly that for each one, with a title on every code block showing which file it goes in:

- [Wire up: full-width](/starlight-layouts/install/wire-full-width/)
- [Wire up: minimal](/starlight-layouts/install/wire-minimal/)
- [Wire up: with-aside](/starlight-layouts/install/wire-with-aside/)
- [Wire up: dashboard](/starlight-layouts/install/wire-dashboard/) (for the full-width treatment beyond the widgets alone)
