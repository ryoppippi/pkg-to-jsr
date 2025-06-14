import { globSync } from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';
import isolatedDecl from 'bun-plugin-isolated-decl';
import { consola } from 'consola';

import pj from '../package.json';

function relativePath(p: string): string {
	return path.resolve(import.meta.dir, p);
}

const outdir = relativePath('../dist');

if (import.meta.main) {
	await $`rm -rf ${outdir}`;

	consola.info('Building...');
	await Bun.build({
		entrypoints: globSync(relativePath('../src/**/*.ts')),
		outdir,
		target: 'node',
		minify: true,
		splitting: false,
		external: Object.keys(pj.dependencies),
		plugins: [
			isolatedDecl(),
		],
	});

	consola.success('Build completed');
}
