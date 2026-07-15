import PageFrame from './PageFrame.astro';
import { minimalMeta } from './layout.meta';

export const minimalLayout = {
	...minimalMeta,
	PageFrame,
};
