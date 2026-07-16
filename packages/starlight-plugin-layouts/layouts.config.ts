// Assembles the full descriptor — metadata plus any custom component
// references — for every one of the four layout packages this plugin
// bundles. Same registry shape as the tutorial site's own
// `apps/site/src/layouts.config.ts`; only the import specifiers differ
// (published package names here, since this file ships inside a package
// that has to work in any consumer's project, not just this monorepo).
//
// See: tutorial/starlight-plugin.md
import { fullWidthLayout } from '@dagilleland/layout-full-width';
import { minimalLayout } from '@dagilleland/layout-minimal';
import { withAsideLayout } from '@dagilleland/layout-with-aside';
import { dashboardLayout } from '@dagilleland/layout-dashboard';
import type { LayoutId } from './layouts.meta';

const layouts = [fullWidthLayout, minimalLayout, withAsideLayout, dashboardLayout];

export function getLayout(id: LayoutId | undefined) {
	return layouts.find((layout) => layout.id === id);
}
