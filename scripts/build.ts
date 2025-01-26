import path from 'node:path';
import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';
import isolatedDecl from 'bun-plugin-isolated-decl';
import pj from '../package.json';

function relativePath(p: string): string {
	const { dir } = import.meta;
	return path.resolve(dir, p);
}

await Bun.build({
	entrypoints: [
		relativePath('../src/index.ts'),
		require.resolve('../src/cli.ts'),
	],
	outdir: relativePath('../dist'),
	target: 'node',
	minify: true,
	external: Object.keys(pj.dependencies),
	plugins: [
		UnpluginTypia({ cache: false }),
		isolatedDecl(),
	],
});
