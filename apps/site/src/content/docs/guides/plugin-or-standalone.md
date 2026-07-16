---
title: Plugin or standalone layouts?
description: When to install @dagilleland/starlight-plugin-layouts versus wiring up individual layout packages by hand.
---

[Turning it into a Starlight plugin](/starlight-layouts/tutorial/starlight-plugin/) covers how
`@dagilleland/starlight-plugin-layouts` bundles all four layouts into one
`plugins: [starlightLayouts()]` line. This page covers the question that
raises: when should you reach for the plugin, and when are you better off
installing a layout package directly and following its
[wire-up page](/starlight-layouts/install/wire-full-width/)?

The short version: it comes down to whether you're **competing over a
component override slot** — with your own code, or with another plugin.

## The four slots, and who needs each one

The plugin claims four Starlight override slots. Not every layout uses
every slot — knowing which layout needs which slot is what makes this a
precise question instead of a vague one:

| Slot | Used by |
| --- | --- |
| `PageFrame` | `minimal` only |
| `TwoColumnContent` | `full-width`, `minimal`, `dashboard` (the shared `wide` trait) |
| `ContentPanel` | `full-width`, `minimal`, `dashboard` (the shared `wide` trait) |
| `PageSidebar` | `with-aside` only |

A conflict only exists where a slot you already use overlaps with a slot a
layout you want actually needs. Having *some* existing override doesn't
rule the plugin out by itself.

## Use the plugin when

- You're starting from a clean Starlight site, or none of your existing
  overrides/plugins touch the four slots above.
- You want two or more of the four layouts, and don't need to read or
  modify the override code to get there.
- You'd rather have one dependency to update than four files living in
  your own project.

## Use the layout packages directly when

**You already have your own override on a slot a layout you want needs.**
Say you've already written a custom `PageFrame.astro` — a docs-wide
announcement banner, a non-standard header, whatever the reason — and you
want the `minimal` layout, which also needs `PageFrame`. Installing
`starlightLayouts()` doesn't merge with your override; it replaces it
outright:

```js title="astro.config.mjs — this loses your custom PageFrame"
starlight({
  components: {
    PageFrame: './src/components/overrides/PageFrame.astro', // yours
  },
  plugins: [starlightLayouts()], // silently wins the PageFrame slot
});
```

This isn't a bug to work around — it's the tradeoff covered in
[Turning it into a Starlight plugin](/starlight-layouts/tutorial/starlight-plugin/#why-four-independent-plugins-would-break):
a plugin's `config:setup` hook runs after your own top-level `components`
config is already established, and it unconditionally sets the keys it
owns. Order in `plugins: [...]` doesn't change this outcome for your own
directly-set overrides — they lose every time, regardless of where the
plugin sits in the array.

The fix is to install `@dagilleland/layout-minimal` on its own and follow
[Wire up: minimal](/starlight-layouts/install/wire-minimal/), folding its dispatcher logic
into your *existing* `PageFrame.astro` by hand instead of letting a plugin
replace the whole file. You keep your banner, you get the layout, and
there's exactly one `PageFrame.astro` in your project either way.

**You're already using another plugin that touches one of these four
slots.** Same mechanism, different source: whichever plugin runs last in
`plugins: [...]` wins that slot, silently. Unlike your own code, you don't
control the other plugin's source to merge logic into it — so this case
has no clean fix beyond avoiding the combination. Install the specific
layout package(s) you need and wire them into your own override file
instead, where you *can* see and combine both pieces of logic.

**You only want one or two of the four layouts.** The plugin is
all-or-nothing for dependencies and slot ownership — installing it pulls
in all four layout packages and claims all four slots, even if you only
ever use `with-aside`. Installing just `@dagilleland/layout-with-aside`
keeps the dependency and the slot ownership scoped to what you're
actually using.

**You want to read or modify the override code.** The plugin's dispatcher
components live inside its package, imported as a black box. If you want
to tweak the `wide` treatment's padding, or understand what's actually
happening before shipping it, installing the layout package directly and
following its wire-up page puts the same code in your own project, where
you'd naturally go looking for it.

**This is a long-lived or team project.** A collision from your own code
is easy to spot — it's sitting right there in your `astro.config.mjs`. A
collision from a second plugin, added by a teammate months later for an
unrelated reason, fails silently: no error, no warning, just a layout that
used to work and quietly doesn't anymore. Keeping the override in your own
project, where a `git blame` or a grep for `PageFrame` turns up the answer
immediately, is worth the extra manual step on a codebase other people
will maintain.

## The quick check

Before installing `@dagilleland/starlight-plugin-layouts`, look for two
things:

1. Does your `astro.config.mjs`'s own `components: {...}` already set
   `PageFrame`, `TwoColumnContent`, `PageSidebar`, or `ContentPanel`?
2. Does any other entry in your `plugins: [...]` array register one of
   those same four slots?

If either is true, and the layout you want needs that specific slot (see
the table above), install that layout's package directly instead — the
plugin's convenience isn't worth a silent conflict.
