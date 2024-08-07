import { ryoppippi } from '@ryoppippi/eslint-config';

export default ryoppippi({
	svelte: false,
	typescript: {
		tsconfigPath: './tsconfig.json',
		overrides: {
			'import/no-extraneous-dependencies': ['error'],
		},
	},
});
