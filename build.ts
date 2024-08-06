import { $ } from 'bun';
import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';

const outdir = `dist`;

await $`rm -rf ${outdir}`;

await Bun.build({
	entrypoints: ['./src/index.ts'],
	target: 'node',
	external: ['*'],
	outdir,
	naming: '[dir]/[name].mjs',
	plugins: [
		UnpluginTypia({ cache: false }),
	],
});
