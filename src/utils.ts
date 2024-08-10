import fs from 'node:fs/promises';
import process from 'node:process';
import { dirname, join, parse, resolve } from 'pathe';

import typia from 'typia';
import consola from 'consola';
import type { Exports, JSR, PackageJson } from './type';

const isStartWithExclamation = typia.createIs<`!${string}`>();

/**
 * Find a file in the directory hierarchy
 */
export async function findUp(
	name: string | string[],
	{ cwd }: { cwd: string | undefined },
): Promise<string | undefined> {
	let directory = resolve(cwd ?? process.cwd());
	const { root } = parse(directory);
	const names = [name].flat();

	while (directory && directory !== root) {
		for (const name of names) {
			const filePath = join(directory, name);

			try {
				const stats = await fs.stat(filePath);
				if (stats.isFile()) {
					return filePath;
				}
			}
			catch {}
		}

		directory = dirname(directory);
	}
}

/**
 * Get include field from package.json
 */
export async function readPkgJSON(pkgJSONPath: string): Promise<PackageJson> {
	const pkgJSON = await fs.readFile(pkgJSONPath, 'utf-8');
	return JSON.parse(pkgJSON) as PackageJson;
}

/**
 * Write JSR to file
 */
export async function writeJsr(jsrPath: string, jsr: JSR): Promise<void> {
	return fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));
}

/**
 * generate include for JSR from package.json
 */
export function getInclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;

	if (files == null) {
		return;
	}

	return files.filter(file => isStartWithExclamation(file));
}

/**
 * generate exclude for JSR from package.json
 */
export function getExclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;

	if (files == null) {
		return;
	}

	return files
		.filter(file => !isStartWithExclamation(file))
		.map((file) => {
			if (file.startsWith('!')) {
				return file.slice(1);
			}
			return file;
		});
}

/**
 * generate exports filed for JSR from package.json
 * the import path should be string, { jsr: string }, { import: string }
 *
 * @example
 * ```json
 * {
 *   "exports": './index.js',
 * }
 * ```
 * will get coverted into
 * ```json
 * {
 *   "exports": {
 *     ".": "./index.js"
 *   }
 * }
 * ```
 *
 * @example
 * ```json
 * {
 *   "exports": {
 *     ".": "./index.js",
 *     "./sub": "./sub.js"
 *   }
 * }
 * ```
 * will get coverted into
 * ```json
 * {
 *   "exports": {
 *     ".": "./index.js",
 *     "./sub": "./sub.js"
 *   }
 * }
 * ```
 *
 * @example
 * ```json
 * {
 *   "exports": {
 *     ".": {
 *       "jsr": "./src/index.ts",
 *       "import": "./dist/index.js"
 *       "types": "./dist/index.d.ts"
 *     },
 *     "./sub": {
 *       "jsr": "./src/sub.ts"
 *       "import": "./dist/sub.js"
 *       "types": "./dist/sub.d.ts"
 *	   }
 *   }
 * }
 * ```
 * will get coverted into
 * ```json
 * {
 *   "exports": {
 *     ".": "./src/index.ts",",
 *     "./sub": "./src/sub.ts"
 *   }
 * }
 * ```
 */
export function getExports(pkgJSON: PackageJson): Exports | undefined {
	const { exports } = pkgJSON;

	if (exports == null) {
		return;
	}

	if (typia.is<string>(exports)) {
		return { '.': exports };
	}

	const _exports = {} as Record<string, string>;

	for (const [key, value] of Object.entries(exports)) {
		switch (true) {
			case typia.is<string>(value):
				_exports[key] = value;
				break;
			case typia.is<Record<string, string>>(value):
				/* if jsr is defined, use it, otherwise use import */
				_exports[key] = value.jsr ?? value.import;
				break;
			default:
				consola.error(`Export key ${key} is ignored because it is not a string or object`);
		}
	}

	if (Object.keys(_exports).length === 0) {
		return;
	}

	return _exports;
}

/**
 * generate JSR from package.json
 */
export function genJsrFromPkg({ pkgJSON }: { pkgJSON: PackageJson }): JSR {
	const { name, version } = pkgJSON;
	const jsr = {
		name: name as string,
		version: version as string,
		publish: {
			include: getInclude(pkgJSON),
			exclude: getExclude(pkgJSON),
		},
		exports: getExports(pkgJSON),
	} as const satisfies JSR;

	/* check the JSR object */
	typia.assertEquals<JSR>(jsr);

	return jsr;
}
