# `@dagilleland/layout-dashboard`

Part of [Starlight Layouts](https://gilleland.ca/starlight-layouts/) — a tutorial site for overriding Starlight components to build custom page layouts. This one fills a full-width page with a grid of stat widgets, the closest thing in this family to a traditional dashboard.

## What's here

- `layout.meta.ts` — `{ id: 'dashboard', wide: true }`.
- `DashboardGrid.astro` — a responsive CSS grid wrapper. Default slot only; no props. Collapses to a single column at print time (see below).
- `Widget.astro` — a single stat tile. Props:
  - `title: string` — small caption label.
  - `value: string` — the headline number, rendered large.
  - `trend?: 'up' | 'down' | 'flat'` — pairs a color with a symbol (▲ / ▼ / •); never color alone, so the trend still reads for anyone scanning a black-and-white printout or with color-vision deficiency.
  - `delta?: string` — the comparison text shown next to the trend symbol, e.g. `"4.2% vs last week"`.
  - `wide?: boolean` — spans 2 grid columns instead of 1, for a page's headline metric. Resets to 1 column at print time regardless (see below).
  - Default slot — one short clarifying sentence, rendered small and muted below the value. Not for paragraphs.
- `index.ts` — combines `layout.meta.ts` as `dashboardLayout`, and separately re-exports `DashboardGrid`/`Widget` — these two aren't used by any Starlight override at all, they're meant for direct use in your page content.

Unlike the other three packages in this family, **the components here are useful immediately, without building any override at all** — see below.

## Using this in a pnpm workspace monorepo

See [Building: dashboard layout](https://gilleland.ca/starlight-layouts/tutorial/dashboard-layout/) for the `wide`-layout override mechanism, and [Filling a dashboard](https://gilleland.ca/starlight-layouts/guides/dashboard-widgets/) for content-design tips — one widget per idea, lead with the number, establishing a size hierarchy with `wide`, keeping widget count sane (four to eight is comfortable), and more.

## Using this standalone, in your own project

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) — both components are styled entirely with Tailwind utility classes, referencing Starlight's own `--sl-color-*` custom properties so they automatically match your site's theme.

### The easy part: use the widgets in any page, today

`DashboardGrid` and `Widget` are just Astro components — install the package and import them, no override, no frontmatter field, no dispatcher:

```sh
npm install @dagilleland/layout-dashboard
```

Works the same with `pnpm add`, `yarn add`, or `bun add`.

```mdx
import { DashboardGrid, Widget } from '@dagilleland/layout-dashboard';

<DashboardGrid>
  <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
  <Widget title="Error rate" value="0.8%" trend="down" delta="0.3pt vs last week" />
</DashboardGrid>
```

This renders inside your page's normal content column — sidebar, table of contents, and content-width cap all unaffected. Good enough if you just want a stat grid somewhere on an otherwise ordinary page.

### The rest: the full-width "dashboard" treatment

If you also want the grid to span the full page width — no right-hand table of contents, no content-width cap — that's the same `wide` mechanism as [`layout-full-width`](../layout-full-width/README.md): a `TwoColumnContent` override and a `ContentPanel` override, both checking a `pageLayout` frontmatter field. See that package's README for the full code; everything there applies here unchanged, just with `'dashboard'` as the matched value instead of `'full-width'`.

### Print handling, already covered

Both components carry `print:` variants so you don't have to think about this: `DashboardGrid` collapses to a single column at print time (multi-column CSS Grid pagination across physical page breaks is inconsistently supported across print engines; a plain vertical stack fragments predictably everywhere), and `Widget` gets `break-inside: avoid` so a tile never gets sliced across a page boundary. `wide` widgets also reset to a single column at print time, since a 2-column span inside a 1-column grid would otherwise force a malformed extra track. Colors need no special handling either — everything routes through `--sl-color-*`, which Starlight's own `print.css` already remaps to print-safe values.
