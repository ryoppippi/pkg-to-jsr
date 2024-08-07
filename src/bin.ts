import fs from 'node:fs/promises';
import { resolve } from 'pathe';
import { findWorkspaceDir, readPackageJSON, resolvePackageJSON } from 'pkg-types';
import { consola } from 'consola';
import { genJsrFromPkg } from './utils';
import { loadConfig } from './config';

const options = await loadConfig();

const { rootDir: _rootDir } = options;
const rootDir = _rootDir ?? await findWorkspaceDir();

const pkgJSONPath = await resolvePackageJSON(rootDir);
const pkgJSON = await readPackageJSON(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const jsr = genJsrFromPkg({ pkgJSON, options });

await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));

consola.success(`Generated ${jsrPath}`);
