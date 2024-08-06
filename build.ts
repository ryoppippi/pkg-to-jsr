import path from 'node:path';
import { $, Glob } from 'bun';
import isolatedDecl from 'bun-plugin-isolated-decl';
import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';

const outdir = `dist`;

await $`rm -rf ${outdir}`;

const glob = new Glob('./src/*.ts');
const entrypoints = await Array.fromAsync(glob.scan('.'));

await Bun.build({
	entrypoints,
	target: 'node',
	external: ['*'],
	outdir,
	naming: '[dir]/[name].mjs',
	plugins: [
		UnpluginTypia({ cache: false, log: 'verbose' }),
		isolatedDecl(),
	],
});
