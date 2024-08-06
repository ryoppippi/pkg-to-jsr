import UnpluginTypia from '@ryoppippi/unplugin-typia/bun';

await Bun.build({
	entrypoints: ['./src/index.ts'],
	target: 'node',
	external: ['*'],
	outdir: './dist',
	plugins: [
		UnpluginTypia({ cache: false }),
	],
});
