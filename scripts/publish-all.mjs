// Publishes every non-private package under packages/*, skipping any
// whose current `version` is already live on the npm registry — mirrors
// `pnpm -r publish`'s own skip-already-published behavior, without
// invoking pnpm's publish command at all.
//
// Each package publishes with plain `npm publish`, except ones that
// define their own "release" script (currently just
// @dagilleland/starlight-plugin-layouts, which has to resolve its
// workspace:* dependencies to real version numbers before npm can
// understand them — see packages/starlight-plugin-layouts/publish.mjs)
// — those run `npm run release` instead, so package-specific publish
// logic stays colocated with the package it belongs to, not duplicated
// or special-cased here.
//
// Usage: npm run release [-- --dry-run]
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packagesDir = path.join(rootDir, 'packages');
const dryRun = process.argv.includes('--dry-run');

function getPublishedVersion(name) {
	try {
		return execSync(`npm view ${name} version`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return null; // not published yet
	}
}

const packageDirs = readdirSync(packagesDir).filter((name) =>
	statSync(path.join(packagesDir, name)).isDirectory(),
);

for (const dir of packageDirs) {
	const cwd = path.join(packagesDir, dir);
	const pkg = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
	if (pkg.private) continue;

	const published = getPublishedVersion(pkg.name);
	if (published === pkg.version) {
		console.log(`○ ${pkg.name}@${pkg.version} already published, skipping`);
		continue;
	}

	console.log(`→ publishing ${pkg.name}@${pkg.version}...`);
	const hasReleaseScript = Boolean(pkg.scripts?.release);
	const cmd = hasReleaseScript
		? `npm run release${dryRun ? ' -- --dry-run' : ''}`
		: `npm publish --access public${dryRun ? ' --dry-run' : ''}`;
	execSync(cmd, { stdio: 'inherit', cwd });
}
