import process from 'node:process';
import fs from 'node:fs/promises';
import { cli } from 'cleye';

import { isAbsolute, resolve } from 'pathe';

import { description, name, version } from '../package.json';
import { _throwError, logger } from './logger';
import { findPackageJSON, genJsrFromPackageJson, readPkgJSON, writeJsr } from '.';

const LOG_LEVEL_SILENT = 0; // Fatal and Error
const LOG_LEVEL_NORMAL = 3; // Informational logs, success, fail, ready, start, ...

function resolveJsrPath(root: string): string {
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
			silent: {
				type: Boolean,
				alias: 's',
				description: 'Suppress non-error logs',
			},
		},

		help: {
			description,
		},
	});

	const { root, silent } = argv.flags;

	logger.level = silent === true ? LOG_LEVEL_SILENT : LOG_LEVEL_NORMAL;

	/** current working directory or maybe file */
	const cwd
	= isAbsolute(root as string)
		? root as string
		: root != null
			? resolve(process.cwd(), root)
			: process.cwd();

	/* check if root is a directory */
	if (!(await fs.lstat(cwd)).isDirectory()) {
		_throwError(`${root} is not a valid root directory`);
	}

	const pkgJSONPath = await findPackageJSON({ cwd });
	const jsrPath = resolveJsrPath(cwd);

	const pkgJSON = await readPkgJSON(pkgJSONPath);
	const jsr = genJsrFromPackageJson({ pkgJSON });

	await writeJsr(jsrPath, jsr);

	logger.success(`Generated ${jsrPath}`);
}
