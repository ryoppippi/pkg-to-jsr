import { $ } from 'bun'
import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/cli.ts',
	outDir: 'dist',
	format: 'esm',
	minify: false,
	clean: true,
	publint: true,
	unused: true,
	nodeProtocol: true,
	hooks: {
		'build:before': async () => {
			await $`bun ./scripts/gen_types.js`
		},
	},
})
