// Imports only the zero-import `*/meta` submodule from each layout package
// (never a package's full entry point, which pulls in `.astro` components).
// Re-exported from the plugin's main entry so consumers can build their
// `pageLayout` schema field from the same source of truth this plugin uses
// internally, instead of retyping the layout IDs by hand.
//
// See: tutorial/starlight-plugin.md
import { fullWidthMeta } from '@dagilleland/layout-full-width/meta';
import { minimalMeta } from '@dagilleland/layout-minimal/meta';
import { withAsideMeta } from '@dagilleland/layout-with-aside/meta';
import { dashboardMeta } from '@dagilleland/layout-dashboard/meta';

export const layoutIds = [
	fullWidthMeta.id,
	minimalMeta.id,
	withAsideMeta.id,
	dashboardMeta.id,
] as const;

export type LayoutId = (typeof layoutIds)[number];
