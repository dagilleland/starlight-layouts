---
title: Install layouts via pnpm
description: How to add one or more layout packages from this repository straight into your own Astro Starlight project, using pnpm's git-with-subdirectory dependency support.
---

You don't need to clone this whole monorepo to use one of its layouts. If you already have your own Astro + Starlight site, pnpm can install a single package straight out of a subdirectory of this GitHub repo — no publishing, no registry, no forking required.

This page covers that path specifically. If you're cloning or forking the whole project instead — to follow the tutorial, or run the demo site yourself — the packages are already wired together via `workspace:*`; see [Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) for how that fits together.

## tl;dr

Already know this page, just here to grab the commands for a new project? Run all four:

```sh
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-full-width"
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-minimal"
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-with-aside"
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-dashboard"
```

Only want a subset? Drop whichever lines you don't need — see [Installing more than one](#installing-more-than-one). Each package's README (installed alongside its code) has the wiring steps for that specific layout — see [What you get, and what you still have to do](#what-you-get-and-what-you-still-have-to-do).

## This requires pnpm specifically

The syntax below — a git dependency that points at one subdirectory rather than a whole repo — is a **pnpm feature** (shipped in pnpm v9+), not part of the git-dependency spec that npm and yarn implement, and not currently supported by bun either. If you're on a different package manager, this page's approach won't work as written; see [Manually copying layouts](/starlight-layouts/install/manual-copy/) instead.

## Installing one layout

Each layout lives in its own directory under `packages/` in this repo. Point pnpm at the one you want with `#<branch>&path:<directory>`:

```sh
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-dashboard"
```

Quote the whole value — `&` is a shell special character, and an unquoted one will do something you don't want.

This installs `@starlight-layouts/layout-dashboard` into your `node_modules` and adds it to your `package.json`, using the package's own name and version (not the value you typed):

```json title="package.json (after install)"
{
  "dependencies": {
    "@starlight-layouts/layout-dashboard": "github:dagilleland/starlight-layouts#main&path:packages/layout-dashboard"
  }
}
```

The four layout directories, if you want a different one:

| Layout | `path:` value |
| --- | --- |
| Full-width | `packages/layout-full-width` |
| Minimal | `packages/layout-minimal` |
| With aside | `packages/layout-with-aside` |
| Dashboard | `packages/layout-dashboard` |

## Installing more than one

None of the four packages depend on each other, so you can install any subset — each is its own `pnpm add` line (or its own entry if you're editing `package.json` by hand):

```sh
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-dashboard"
pnpm add "github:dagilleland/starlight-layouts#main&path:packages/layout-with-aside"
```

You're never forced to take all four "as a set."

## What you get, and what you still have to do

This installs the package's raw source — the same `.astro`/`.ts` files you'd find in the repo, no build step, the same way this project's own app consumes `@astrojs/starlight-tailwind`. What it does **not** do is wire the layout into your Starlight site: registering an override component, adding a content-schema field, and so on are still manual steps.

Each package's own README covers exactly that, and it installs right alongside the code — open `node_modules/@starlight-layouts/<package-name>/README.md` after installing, or read it on GitHub first: [`layout-full-width`](https://github.com/dagilleland/starlight-layouts/tree/main/packages/layout-full-width#readme), [`layout-minimal`](https://github.com/dagilleland/starlight-layouts/tree/main/packages/layout-minimal#readme), [`layout-with-aside`](https://github.com/dagilleland/starlight-layouts/tree/main/packages/layout-with-aside#readme), [`layout-dashboard`](https://github.com/dagilleland/starlight-layouts/tree/main/packages/layout-dashboard#readme).

## Pin a version instead of tracking `main`

`#main` means every `pnpm install` re-fetches whatever the branch currently points at — fine while you're getting started, but this project's `main` branch will keep changing as the tutorial evolves. Once you're happy with a layout, pin to a commit SHA instead so your install stops moving:

```sh
pnpm add "github:dagilleland/starlight-layouts#a1b2c3d&path:packages/layout-dashboard"
```

Find a commit's SHA on the repo's [commit history](https://github.com/dagilleland/starlight-layouts/commits/main/) page. `pnpm update` won't touch a SHA-pinned dependency until you deliberately change the SHA yourself.

## Removing a layout

Same as any other dependency:

```sh
pnpm remove @starlight-layouts/layout-dashboard
```

Then remove whatever override/schema wiring you added by hand for it — uninstalling the package doesn't undo that part.
