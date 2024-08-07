import fs from 'node:fs/promises';
import { dirname, resolve } from 'pathe';
import { readPackageJSON, resolvePackageJSON } from 'pkg-types';
import { genJsrFromPkg } from './utils';
import { loadConfig } from './config';

const pkgJSONPath = await resolvePackageJSON();
const pkgJSON = await readPackageJSON(pkgJSONPath);
const rootDir = dirname(pkgJSONPath);
const jsrPath = resolve(rootDir, 'jsr.json');

const options = await loadConfig();

const jsr = genJsrFromPkg({ pkgJSON, options });

await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));

console.log(`Generated ${jsrPath}`); // eslint-disable-line no-console
