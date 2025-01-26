import path from 'node:path';
import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';
import isolatedDecl from 'bun-plugin-isolated-decl';

function relativePath(p: string): string {
	const { dir } = import.meta;
	return path.resolve(dir, p);
}

await Bun.build({
	entrypoints: [relativePath('../src/index.ts')],
	outdir: relativePath('../dist'),
	target: 'node',
	minify: true,
	plugins: [
		UnpluginTypia({ cache: false }),
		isolatedDecl(),
	],
});
