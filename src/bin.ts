import process from 'node:process';

import { dirname, resolve } from 'pathe';
import { consola } from 'consola';

import { findUp, genJsrFromPkg, readPkgJSON, writeJsr } from './utils';

const pkgJSONPath = await findUp('package.json', { cwd: process.cwd() });
if (pkgJSONPath == null) {
	consola.error('Cannot find package.json');
	process.exit(1);
}

const pkgJSON = await readPkgJSON(pkgJSONPath);

const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = genJsrFromPkg({ pkgJSON });
try {
	await writeJsr(jsrPath, jsr);
}
catch (e: unknown) {
	consola.error(`Failed to write JSR to ${jsrPath}: ${e?.toString()}`);
	process.exit(1);
}

consola.success(`Generated ${jsrPath}`);
