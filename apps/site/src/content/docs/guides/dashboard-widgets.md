---
title: Filling a dashboard
description: Tips for deciding what goes inside a dashboard page and how to design individual widgets, using this site's DashboardGrid and Widget components.
---

The [dashboard layout tutorial](/tutorial/dashboard-layout/) covers *how*
`pageLayout: dashboard` frees up the width for a widget grid. This page covers
the part that's harder to get from reading component code: what to actually
put in that space. See [`/demos/dashboard/`](/demos/dashboard/) for the
examples referenced below.

## One widget, one idea

Each `Widget` should answer a single question at a glance — "how many
active users right now," not "everything about users." If you find yourself
wanting a widget with three headline numbers in it, that's two or three
widgets. Splitting them lets someone scan the grid and stop on exactly the
one they came for.

## Lead with the number

Put the value first, both visually and in importance — large, high-contrast
text, with the label as a small caption above it rather than a heading
above a small number. A dashboard is scanned, not read top to bottom; the
number is what a user's eye should land on first.

```astro
<Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
```

## Numbers need context

A bare `2,481` doesn't tell anyone whether that's good. Pair values with
either a trend (`up` / `down` / `flat` plus a `delta`, as in the demo) or,
failing that, a comparison baked into the label itself (`"vs. last
release"`). If a metric genuinely has no useful comparison yet — a brand
new counter, for instance — it's fine to omit `delta` rather than invent a
misleading one; `Widget` renders fine without it.

## Use color as reinforcement, not the only signal

`Widget`'s `trend` prop pairs a color with a symbol (▲ / ▼ / •) and the
delta text — never color alone. Someone with color-vision deficiency, or
anyone scanning a black-and-white printout, should still be able to tell an
increase from a decrease. If you extend `Widget` yourself, keep that
pairing rather than dropping to color-only badges or dots.

## Establish a size hierarchy

Not every metric deserves equal visual weight. `Widget` accepts a `wide`
prop that spans two grid columns — reserve it for the one or two headline
numbers on a page (revenue, the metric the page exists to report on) and
leave everything else at the default single-column size. A grid where every
tile is the same size reads as a wall of numbers instead of a story with a
lead.

```astro
<Widget title="Monthly revenue" value="$48.2k" trend="up" delta="6.1% vs last month" wide>
  Driven mostly by renewals; new-business bookings were flat.
</Widget>
```

## Keep widget count sane

Four to eight widgets is a comfortable range for a single dashboard view —
[the demo page](/demos/dashboard/) uses eight. Past that, group related
metrics onto separate dashboard pages (linked from the sidebar, same as any
other page) rather than growing one grid indefinitely. If two widgets are
frequently read together, that's a sign they belong on the same page; if a
widget is rarely glanced at, it may not deserve a permanent spot at all.

## The slot is for one sentence, not a report

`Widget`'s default slot renders below the value, in smaller, muted text —
use it for a single clarifying sentence ("Driven mostly by renewals…"), not
paragraphs. If a number needs a paragraph of explanation, that explanation
belongs on a linked detail page, not crammed into the tile.

## Printing a dashboard

Nothing here requires a decision from you — it's covered automatically —
but it's worth knowing what's actually handled. `DashboardGrid` and
`Widget` both carry `print:` variants: the grid collapses to a single
column for print (multi-column CSS Grid pagination across physical page
breaks is inconsistently supported across print engines, while a plain
vertical stack fragments predictably everywhere), and each widget gets
`break-inside: avoid` so one tile never gets sliced across a page boundary.
`wide` widgets also reset to a single column at print time, since a
2-column span inside a 1-column grid would otherwise force a malformed
extra track.

Colors need no special handling on your part either: `Widget` reads every
color from Starlight's own `--sl-color-*` tokens, which Starlight's
built-in `print.css` already remaps to print-safe values (dark text on a
white background, regardless of the page's on-screen theme) — the same
mechanism covered in [Composing layout packages](/tutorial/composing-layout-packages/)
for end-user theming applies here too.

## Static demo, live dashboard

Every widget in [`/demos/dashboard/`](/demos/dashboard/) has a hardcoded
value, since this site has no backend. In a real dashboard, `Widget` would
receive its `value`, `trend`, and `delta` props from fetched data — the
component itself doesn't care where the numbers come from, but real usage
should also account for loading and empty states (a skeleton while data
loads, and an explicit "no data yet" rather than a blank or zeroed tile)
that this demo skips for simplicity.
