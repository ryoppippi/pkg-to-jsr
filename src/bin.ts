import process from 'node:process';

import { dirname, resolve } from 'pathe';
import { consola } from 'consola';

import { findPackageJSON, genJsrFromPkg, readPkgJSON, writeJsr } from '.';

const pkgJSONPath = await findPackageJSON({ cwd: process.cwd() });

const pkgJSON = await readPkgJSON(pkgJSONPath);

const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = genJsrFromPkg({ pkgJSON });
await writeJsr(jsrPath, jsr);

consola.success(`Generated ${jsrPath}`);
