import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	type: 'lib',
	svelte: false,
	ignores: ['tsdown.config.ts', 'vite.config.ts', 'tests/**/*.json'],
	typescript: {
		tsconfigPath: './tsconfig.json',
		overrides: {
			'import/no-extraneous-dependencies': ['error'],
		},
	},
});
