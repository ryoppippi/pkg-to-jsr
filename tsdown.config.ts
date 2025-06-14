import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/**/*.ts',
	outDir: 'dist',
	target: 'node22',
	format: 'esm',
	minify: true,
	dts: true,
	clean: true,
	external: [
		'cleye',
		'consola',
		'terminal-link',
	],
})