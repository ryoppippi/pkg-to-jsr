import process from 'node:process';

import { dirname, resolve } from 'pathe';
import { consola } from 'consola';

import { findUp, genJsrFromPkg, readPkgJSON, writeJsr } from '.';

function throwError(message: string): never {
	consola.error(message);
	process.exit(1);
}

const pkgJSONPath = await findUp('package.json', { cwd: process.cwd() });
if (pkgJSONPath == null) {
	throwError('Cannot find package.json');
}

const pkgJSON = await readPkgJSON(pkgJSONPath);

const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = genJsrFromPkg({ pkgJSON });
try {
	await writeJsr(jsrPath, jsr);
}
catch (e: unknown) {
	throwError(`Failed to write JSR to ${jsrPath}: ${e?.toString()}`);
}

consola.success(`Generated ${jsrPath}`);
