// Imports only the zero-import `*/meta` submodule from each layout package
// (never a package's full `index.ts`, which pulls in `.astro` components).
// This file is safe to import from `content.config.ts`, which runs in a
// context that shouldn't have to compile `.astro` files.
//
// See: tutorial/composing-layout-packages.md
import { fullWidthMeta } from '@starlight-layouts/layout-full-width/meta';
import { minimalMeta } from '@starlight-layouts/layout-minimal/meta';
import { withAsideMeta } from '@starlight-layouts/layout-with-aside/meta';
import { dashboardMeta } from '@starlight-layouts/layout-dashboard/meta';

export const layoutIds = [
	fullWidthMeta.id,
	minimalMeta.id,
	withAsideMeta.id,
	dashboardMeta.id,
] as const;

export type LayoutId = (typeof layoutIds)[number];
