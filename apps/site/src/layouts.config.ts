// Assembles the full descriptor — metadata plus any custom component
// references — for every installed layout package. Only the four override
// dispatchers under `src/components/overrides/` import this file; the
// content schema imports `layouts.meta.ts` instead (see that file for why).
//
// Adding a 5th layout package means adding it to this array (and to
// `layouts.meta.ts`) — nothing else in `src/components/overrides/` needs
// to change.
//
// See: tutorial/composing-layout-packages.md
import { fullWidthLayout } from '@dagilleland/layout-full-width';
import { minimalLayout } from '@dagilleland/layout-minimal';
import { withAsideLayout } from '@dagilleland/layout-with-aside';
import { dashboardLayout } from '@dagilleland/layout-dashboard';
import type { LayoutId } from './layouts.meta';

const layouts = [fullWidthLayout, minimalLayout, withAsideLayout, dashboardLayout];

export function getLayout(id: LayoutId | undefined) {
	return layouts.find((layout) => layout.id === id);
}
