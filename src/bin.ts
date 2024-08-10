import fs from 'node:fs/promises';
import { resolve } from 'pathe';
import { findWorkspaceDir, readPackageJSON, resolvePackageJSON } from 'pkg-types';
import { consola } from 'consola';
import { genJsrFromPkg } from './utils';

const rootDir = await findWorkspaceDir();

const pkgJSONPath = await resolvePackageJSON(rootDir);
const pkgJSON = await readPackageJSON(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = genJsrFromPkg({ pkgJSON });

await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));

consola.success(`Generated ${jsrPath}`);
