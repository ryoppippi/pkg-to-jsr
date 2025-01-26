import { Glob } from 'bun';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';

import isolatedDecl from 'bun-plugin-isolated-decl';
import pj from '../package.json';

const outdir = relativePath('../dist');

function relativePath(p: string): string {
	const { dir } = import.meta;
	return path.resolve(dir, p);
}

if (import.meta.main) {
	await rm(outdir, { recursive: true, force: true });

	const entrypoints: string[] = [];
	const glob = new Glob(relativePath('../src/**/*.ts'));
	for await (const file of glob.scan('.')) {
		entrypoints.push(file);
	}

	await Bun.build({
		entrypoints,
		outdir,
		target: 'node',
		minify: true,
		splitting: true,
		external: Object.keys(pj.dependencies),
		plugins: [
			UnpluginTypia({ cache: false }),
			isolatedDecl(),
		],
	});
}
