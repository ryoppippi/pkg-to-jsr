import fs from 'node:fs/promises';
import typia from 'typia';
import { dirname, resolve } from 'pathe';
import { readPackageJSON, resolvePackageJSON } from 'pkg-types';
import type { JSR } from './type';
import { getExclude, getInclude } from './utils';

const pkgJSONPath = await resolvePackageJSON();
const pkgJSON = await readPackageJSON(pkgJSONPath);
const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = {
	name: pkgJSON.name as string,
	version: pkgJSON.version as string,
	publish: {
		include: getInclude(pkgJSON),
		exclude: getExclude(pkgJSON),
	},
	exports: pkgJSON.exports,
};

typia.assertEquals<JSR>(jsr);

await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));

console.log(`Generated ${jsrPath}`); // eslint-disable-line no-console
