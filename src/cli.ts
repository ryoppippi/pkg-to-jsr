import process from 'node:process';
import fs from 'node:fs/promises';
import { cli } from 'cleye';

import { isAbsolute, resolve } from 'pathe';
import { consola } from 'consola';

import { description, name, version } from '../package.json';
import { findPackageJSON, genJsrFromPackageJson, readPkgJSON, writeJsr } from '.';

function resolveJsrPath(root: string) {
	return resolve(root, 'jsr.json');
}

export async function main(): Promise<void> {
	const argv = cli({
		name,
		version,
		flags: {
			root: {
				type: String,
				alias: 'r',
				description: 'root directory including package.json',
				placeholder: '[path]',
			},
		},

		help: {
			description,
		},
	});

	const { root } = argv.flags;

	/** current working directory or maybe file */
	const cwd
	= isAbsolute(root as string)
		? root as string
		: root != null
			? resolve(process.cwd(), root)
			: process.cwd();

	/* check if root is a directory */
	if (!(await fs.lstat(cwd)).isDirectory()) {
		consola.error(`${root} is not a valid root directory`);
		process.exit(1);
	}

	const pkgJSONPath = await findPackageJSON({ cwd });
	const jsrPath = resolveJsrPath(cwd);

	const pkgJSON = await readPkgJSON(pkgJSONPath);
	const jsr = genJsrFromPackageJson({ pkgJSON });

	await writeJsr(jsrPath, jsr);

	consola.success(`Generated ${jsrPath}`);
}
