import fs from 'node:fs/promises';
import process from 'node:process';
import { dirname, join, parse, resolve } from 'pathe';

import typia from 'typia';
import consola from 'consola';
import type { PackageJson } from 'pkg-types';
import type { JSRConfigurationFileSchema } from './jsr';

type Exports = JSRConfigurationFileSchema['exports'];

const JSR_NAME_REGEX = /^@[^/]+\/[^/]+$/;

const isStartWithExclamation = typia.createIs<`!${string}`>();
const isString = typia.createIs<string>();

/**
 * Throw an error and exit the process
 * @internal
 */
function _throwError(message: string): never {
	consola.error(message);
	if (process.env.NODE_ENV === 'test') {
		throw new Error(message);
	}
	process.exit(1);
}

/**
 * Handle typia validation error
 */
function _typiaErrorHandler<T>(validation: typia.IValidation<T>): never | typia.IValidation.ISuccess<T> {
	if (!validation.success) {
		const message = validation.errors.map(({ path, expected, value }) =>
			`${path} is invalid. Ecpected type is ${expected}, but got ${value}`,
		).join('\n');
		return _throwError(`Invalid JSR configuration: ${message}`);
	}

	return validation;
}

/**
 * Find a file in the directory hierarchy
 */
export async function findUp(
	name: string | string[],
	{ cwd }: { cwd: string },
): Promise<string | undefined> {
	let directory = resolve(cwd);
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
 * Find package.json in the directory hierarchy
 * if not found, throw an error
 */
export async function findPackageJSON({ cwd }: { cwd: string }): Promise<string> {
	const path = await findUp('package.json', { cwd });
	if (!isString(path)) {
		_throwError(`Cannot find package.json at ${cwd}`);
	}
	return path;
}

/**
 * Get include field from package.json
 */
export async function readPkgJSON(pkgJSONPath: string): Promise<PackageJson> {
	const pkgJSON = await fs.readFile(pkgJSONPath, 'utf-8');
	const validation = typia.json.validateParse<PackageJson>(pkgJSON);
	const { data } = _typiaErrorHandler(validation);
	return data;
}

/**
 * Write JSR to file
 */
export async function writeJsr(jsrPath: string, jsr: JSRConfigurationFileSchema): Promise<void> {
	try {
		return await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));
	}
	catch (e: unknown) {
		_throwError(`Failed to write JSR to ${jsrPath}: ${e?.toString()}`);
	}
}

export function getName(pkgJSON: PackageJson): string {
	const { name, author } = pkgJSON;
	const jsrName = pkgJSON.jsrName as string | undefined;

	if (jsrName != null) {
		if (!JSR_NAME_REGEX.test(jsrName)) {
			_throwError(`Invalid JSR name ${jsrName}. Must be scoped`);
		}
		return jsrName;
	}

	if (name != null && JSR_NAME_REGEX.test(name)) {
		return name;
	}

	if (name != null && author != null && (isString(author) || isString(author?.name))) {
		const _author = isString(author) ? author : author.name;
		return `@${_author}/${name}`;
	}

	const errorMessages = [
		'Cannot determine JSR name from package.json.',
		'1. add jsrName field to package.json',
		'2. use scoped package name (ex: @author/package)',
		'3. add name & author field to package.json ( ex: { "name": "package", "author": { "name": "author" } })',
	] as const;

	_throwError(errorMessages.join('\n'));
}

/**
 * generate include for JSR from package.json
 */
export function getInclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;

	if (files == null) {
		return;
	}

	return files.filter(file => !isStartWithExclamation(file));
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
		.filter(file => isStartWithExclamation(file))
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
export function getExports(pkgJSON: PackageJson): Exports {
	const { exports } = pkgJSON;

	if (exports == null) {
		throw new Error('No exports field found in package.json');
	}

	if (isString(exports)) {
		return { '.': exports };
	}

	const _exports = {} as Record<string, string>;

	for (const [key, value] of Object.entries(exports)) {
		switch (true) {
			case isString(value):
				_exports[key] = value;
				break;
			case typia.is<Record<string, string>>(value):
				/* if jsr is defined, use it, otherwise use import */
				_exports[key] = value.jsr ?? value.import;
				break;
			default:
				consola.warn(`Export key ${key} is ignored because it is not a string or object`);
		}
	}

	if (Object.keys(_exports).length === 0) {
		throw new Error('No valid exports field found in package.json');
	}

	return _exports;
}

/**
 * generate JSR from package.json
 */
export function genJsrFromPackageJson({ pkgJSON }: { pkgJSON: PackageJson }): JSRConfigurationFileSchema {
	const { version } = pkgJSON;

	const include = getInclude(pkgJSON);
	const exclude = getExclude(pkgJSON);
	const jsr = {
		name: getName(pkgJSON),
		version: version as string,
		publish: include != null || exclude != null ? { include, exclude } : undefined,
		exports: getExports(pkgJSON),
	} as const satisfies JSRConfigurationFileSchema;

	/* check the JSR object */
	const validation = typia.validateEquals<JSRConfigurationFileSchema>(jsr);

	const { data } = _typiaErrorHandler(validation);
	return data;
}
