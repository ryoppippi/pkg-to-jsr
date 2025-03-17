import { defineConfig } from '@rslib/core';
import UnpluginTypia from '@ryoppippi/unplugin-typia/rspack';

export default defineConfig({
	tools: {
		rspack: {
			plugins: [
				UnpluginTypia({ cache: false }),
			],
		},
		swc: {
			jsc: {
				experimental: {
					emitIsolatedDts: true,
				},
			},
		},
	},
	source: {
		entry: {
			index: [
				'./src/**',
			],
		},
		tsconfigPath: './tsconfig.build.json',
	},
	lib: [
		{
			format: 'esm',
			bundle: false,
			dts: true,
			output: {
				distPath: {
					root: './dist',
				},
				minify: true,
				sourceMap: true,
			},
		},
	],
});
