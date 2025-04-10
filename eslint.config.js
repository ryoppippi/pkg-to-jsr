import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'lib',
	svelte: false,
	ignores: ['vite.config.ts', 'tests/**/*.json', 'scripts/**'],
	typescript: {
		tsconfigPath: './tsconfig.json',
		overrides: {
			'import/no-extraneous-dependencies': ['error'],
		},
	},
});
