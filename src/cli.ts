#! /usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import { defineCommand, runMain } from 'citty';

import { isAbsolute, resolve } from 'pathe';
import { consola } from 'consola';

import { description, name, version } from '../package.json';
import { findPackageJSON, genJsrFromPackageJson, readPkgJSON, writeJsr } from '.';

function resolveJsrPath(root: string) {
	return resolve(root, 'jsr.json');
}

const main = defineCommand({
	meta: { name, version, description },
	args: {
		root: {
			type: 'string',
			description: 'root directory including package.json',
		},
	},
	async run({ args: { root } }) {
		/** current working directory or maybe file */
		const cwd
			= isAbsolute(root)
				? root
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
	},
	cleanup({ args: { root } }) {
		consola.success(`Generated ${resolveJsrPath(root)}`);
	},
});

await runMain(main);
