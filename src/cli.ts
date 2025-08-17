import fs from 'node:fs/promises';
import process from 'node:process';
import { cli, define } from 'gunshi';

import { isAbsolute, resolve } from 'pathe';

import { findPackageJSON, genJsrFromPackageJson, readPkgJSON, writeJsr } from '.';
import { description, name, version } from '../package.json';
import { _throwError, logger } from './logger';

const LOG_LEVEL_SILENT = 0; // Fatal and Error
const LOG_LEVEL_NORMAL = 3; // Informational logs, success, fail, ready, start, ...

function resolveJsrPath(root: string): string {
	return resolve(root, 'jsr.json');
}

export async function main(): Promise<void> {
	const command = define({
		args: {
			root: {
				type: 'string',
				alias: 'r',
				description: 'root directory including package.json',
			},
			silent: {
				type: 'boolean',
				alias: 's',
				description: 'Suppress non-error logs',
			},
		},
		async run(ctx) {
			const { root, silent } = ctx.values;

			logger.level = silent === true ? LOG_LEVEL_SILENT : LOG_LEVEL_NORMAL;

			/** current working directory or maybe file */
			const cwd
			= root != null && isAbsolute(root)
				? root
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
		},
	});

	await cli(process.argv.slice(2), command, {
		name,
		version,
		description,
	});
}
