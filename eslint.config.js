import { ryoppippi } from '@ryoppippi/eslint-config';
import importX from 'eslint-plugin-import-x';

export default ryoppippi({
	type: 'lib',
	svelte: false,
	ignores: ['vite.config.ts', 'tests/**/*.json', 'scripts/**', 'tsdown.config.ts', '.lsmcp/**'],
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
}, {
	files: ['**/*.?([cm])ts'],
	plugins: {
		'import-x': importX,
	},
	rules: {
		'import-x/no-extraneous-dependencies': 'error',
	},
});
