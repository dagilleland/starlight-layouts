// Publishes this package with plain `npm publish`, after temporarily
// resolving its `workspace:*` dependencies on the four layout packages to
// their real, currently-published version numbers. Plain `npm publish`
// (unlike `pnpm publish`) has no concept of the `workspace:` protocol and
// would otherwise ship that literal, unresolvable string — which is
// exactly what broke installs under bun and any other non-pnpm package
// manager the first time this package was published.
//
// Restores the original `workspace:*` file afterward (success or
// failure) so local monorepo dev keeps working unchanged.
//
// Usage: npm run release [-- --dry-run]
import { copyFileSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(dir, 'package.json');
const backupPath = `${pkgPath}.bak`;
const siblings = ['layout-full-width', 'layout-minimal', 'layout-with-aside', 'layout-dashboard'];

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
for (const sibling of siblings) {
	const siblingPkg = JSON.parse(
		readFileSync(path.join(dir, '..', sibling, 'package.json'), 'utf8'),
	);
	pkg.dependencies[`@dagilleland/${sibling}`] = siblingPkg.version;
}

copyFileSync(pkgPath, backupPath);
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

try {
	const dryRun = process.argv.includes('--dry-run') ? ' --dry-run' : '';
	execSync(`npm publish --access public${dryRun}`, { stdio: 'inherit', cwd: dir });
} finally {
	copyFileSync(backupPath, pkgPath);
	unlinkSync(backupPath);
}
