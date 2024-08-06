import fs from 'node:fs/promises';
import typia from 'typia';
import { dirname, resolve } from 'pathe';
import { readPackageJSON, resolvePackageJSON } from 'pkg-types';
import type { JSR } from './type';

const pkgJSONPath = await resolvePackageJSON();
const pkgJSON = await readPackageJSON(pkgJSONPath);
const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const isStartWithExclamation = typia.createIs<`!${string}`>();
const { files } = pkgJSON;
const include = files == null ? ['dist'] : files.filter(file => isStartWithExclamation(file));
const exclude = files == null
	? undefined
	: files
		.filter(file => !isStartWithExclamation(file))
		.map((file) => {
			if (file.startsWith('!**/')) {
				return file.slice(4);
			}
			if (file.startsWith('!')) {
				return file.slice(1);
			}
			return file;
		});

const jsr = {
	name: pkgJSON.name as string,
	version: pkgJSON.version as string,
	publish: {
		include,
		exclude,
	},
	exports: pkgJSON.exports,
};

typia.assertEquals<JSR>(jsr);

await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));

console.log(`Generated ${jsrPath}`); // eslint-disable-line no-console
