import { $ } from 'bun'
import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/**/*.ts',
	outDir: 'dist',
	format: 'esm',
	minify: true,
	dts: true,
	clean: true,
	publint: true,
	unused: true,
  nodeProtocol: true,
	external: [
		'gunshi',
		'consola',
		'terminal-link',
	],
	hooks: {
		'build:before': async () => {
			await $`bun ./scripts/gen_types.js`
		},
	},
})
