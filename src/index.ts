import fs from 'node:fs/promises';

import typia from 'typia';
import { findUp } from 'find-up-simple';
import terminalLink from 'terminal-link';
import { bold } from 'yoctocolors';
import * as semver from '@std/semver';
import type { PackageJson as OriginalPackageJSON, OverrideProperties, SimplifyDeep } from 'type-fest';
import type { JSRConfigurationFileSchema as _JSRConfigurationFileSchema } from './jsr';
import { _throwError, _typiaErrorHandler, logger } from './logger';

type JSRScopedName = `@${string}/${string}`;
type JSRJson = OverrideProperties<_JSRConfigurationFileSchema, { name: JSRScopedName }>;
type Exports = JSRJson['exports'];
type PackageJson = SimplifyDeep<Pick<OriginalPackageJSON, 'name' | 'author' | 'files' | 'exports' | 'version'> & { jsrName?: string; jsrInclude?: string[]; jsrExclude?: string[] }>;

const isStartWithExclamation = typia.createIs<`!${string}`>();
const isString = typia.createIs<string>();
const isJSRScopedName = typia.createIs<JSRScopedName>();

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
export async function writeJsr(jsrPath: string, jsr: JSRJson): Promise<void> {
	try {
		return await fs.writeFile(jsrPath, JSON.stringify(jsr, null, '\t'));
	}
	catch (e: unknown) {
		_throwError(`Failed to write JSR to ${jsrPath}: ${e?.toString()}`);
	}
}

/**
 * Get JSR name from package.json
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getName({
 *   "name": "package",
 *   "author": "author"
 *  })
 * )
 * .toBe('@author/package');
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getName({
 *   "name": "package",
 *   "author": {
 *     "name": "author",
 *     "email": "example@example.com"
 *   }
 *  })
 * )
 * .toBe('@author/package');
 *```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getName({
 *   "name": "package",
 *   "jsrName": "@author/package"
 *  })
 * )
 * .toBe('@author/package');
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  () => getName({
 *   "name": "package",
 *  })
 * )
 * .toThrowError();
 * ```
 * the function will throw an error because it is not scoped name
 *
 */
export function getName(pkgJSON: PackageJson): JSRScopedName {
	const { name, author } = pkgJSON;
	const jsrName = pkgJSON.jsrName;

	if (isJSRScopedName(jsrName)) {
		return jsrName;
	}

	if (!isString(jsrName) && isJSRScopedName(name)) {
		return name;
	}

	if (!isString(jsrName) && isString(name) && (isString(author) || isString(author?.name))) {
		const _author = isString(author) ? author : author.name;
		const jsrName = `@${_author}/${name}`;
		if (isJSRScopedName(jsrName)) {
			return jsrName;
		}
	}

	const errorMessages = [
		jsrName != null ? `${bold(`jsrName: ${jsrName}`)} is not a valid scoped package name` : undefined,
		jsrName == null && name != null && author == null ? `${bold(`name: ${name}`)} is not a valid scoped package name` : undefined,
		`On JSR, all packages are contained within a scope. See ${terminalLink('https://jsr.io/docs/scopes', 'https://jsr.io/docs/scopes')} for more information`,
		`To fix this issue, you can choose one of the following options:`,
		'1. add jsrName field to package.json',
		'2. use scoped package name (ex: @author/package)',
		'3. add name & author field to package.json ( ex: { "name": "package", "author": { "name": "author" } } will be converted to "@author/package")',
	] as const;

	_throwError(errorMessages.join('\n'));
}

/**
 * generate include for JSR from package.json
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getInclude({
 *   "files": ["src", "dist", "!node_modules"]
 *  })
 * )
 * .toEqual(["src", "dist"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getInclude({
 *   "files": ["dist", "!node_modules"],
 *   "jsrInclude": ["src"]
 *  })
 * )
 * .toEqual(["src", "dist"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getInclude({
 *   "files": ["src", "dist", "!node_modules"],
 *   "jsrInclude": ["src"],
 *  })
 * )
 * .toEqual(["src", "dist"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getInclude({
 *   "files": ["src", "dist", "!node_modules"],
 *   "jsrInclude": ["src"],
 *   "jsrExclude": ["dist"]
 *  })
 * )
 * .toEqual(["src"]);
 * ```
 */
export function getInclude(pkgJSON: PackageJson): string[] | undefined {
	const {
		files = [],
		jsrInclude = [],
		jsrExclude = [],
	} = pkgJSON;

	const includeFromFiles = files.filter(file => !isStartWithExclamation(file));

	const includes = [...jsrInclude, ...includeFromFiles].filter(file => !jsrExclude.includes(file));

	if (includes.length === 0) {
		return;
	}

	return Array.from(new Set(includes));
}

/**
 * generate exclude for JSR from package.json
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExclude({
 *   "files": ["src", "dist", "!node_modules"]
 *  })
 * )
 * .toEqual(["node_modules"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExclude({
 *   "files": ["src", "dist", "!node_modules"],
 *   "jsrExclude": ["dist"]
 *  })
 * )
 * .toEqual(["dist", "node_modules"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExclude({
 *   "files": ["src", "dist", "!node_modules"],
 *   "jsrExclude": ["dist"]
 *  })
 * )
 * .toEqual(["dist", "node_modules"]);
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExclude({
 *   "files": ["src", "dist", "!node_modules"],
 *   "jsrInclude": ["src"],
 *   "jsrExclude": ["dist"]
 *  })
 * )
 * .toEqual(["dist", "node_modules"]);
 * ```
 *
 */
export function getExclude(pkgJSON: PackageJson): string[] | undefined {
	const {
		files = [],
		jsrInclude = [],
		jsrExclude = [],
	} = pkgJSON;

	const excludeFromFiles = files
		.filter(file => isStartWithExclamation(file))
		.map((file) => {
			if (file.startsWith('!')) {
				return file.slice(1);
			}
			return file;
		});

	const excludes = [...jsrExclude, ...excludeFromFiles].filter(file => !jsrInclude.includes(file));

	if (excludes.length === 0) {
		return;
	}

	return Array.from(new Set(excludes));
}

/**
 * generate exports filed for JSR from package.json
 * the import path should be string, { jsr: string }, { import: string }
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExports({
 *   "exports": "./index.js"
 *  })
 * )
 * .toEqual({ ".": "./index.js" });
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExports({
 *   "exports": {
 *     ".": "./index.js",
 *     "./sub": "./sub.js"
 *   }
 *  })
 * )
 * .toEqual(
 *  {
 *    ".": "./index.js",
 *    "./sub": "./sub.js"
 *  }
 * );
 * ```
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  getExports({
 *   "exports": {
 *     ".": {
 *       "jsr": "./src/index.ts",
 *       "import": "./dist/index.js",
 *       "types": "./dist/index.d.ts"
 *     },
 *     "./sub": {
 *       "jsr": "./src/sub.ts",
 *       "import": "./dist/sub.js",
 *       "types": "./dist/sub.d.ts"
 *	   }
 *    }
 *  })
 * )
 * .toEqual(
 *  {
 *    ".": "./src/index.ts",
 *    "./sub": "./src/sub.ts"
 *  }
 * );
 * ```
 *
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
			case typia.is<{ jsr: string }>(value):
				/* if jsr is defined, use it */
				_exports[key] = value.jsr;
				break;
			case typia.is<{ import: string | { default: string } }>(value):
				/* if import is defined, use it */
				_exports[key] = isString(value.import) ? value.import : value.import.default;
				break;
			default:
				logger.warn(`Export key ${key} is ignored because it is not a string or object`);
		}
	}

	if (Object.keys(_exports).length === 0) {
		throw new Error('No valid exports field found in package.json');
	}

	return _exports;
}

/**
 * generate JSR from package.json
 *
 * @example
 * ```ts @import.meta.vitest
 * expect(
 *  genJsrFromPackageJson({
 *   pkgJSON: {
 *     "name": "package",
 *     "author": "author",
 *     "version": "1.0.0",
 *     "files": ["src", "dist", "!node_modules"],
 *     "exports": {
 *       ".": "./src/index.ts",
 *       "./sub": "./src/sub.ts"
 *     }
 *   }
 * })
 * )
 * .toEqual(
 *  {
 *    "name": "@author/package",
 *    "version": "1.0.0",
 *    "publish": {
 *      "include": ["src", "dist"],
 *      "exclude": ["node_modules"]
 *    },
 *    "exports": {
 *      ".": "./src/index.ts",
 *      "./sub": "./src/sub.ts"
 *    }
 *  }
 * );
 * ```
 */
export function genJsrFromPackageJson({ pkgJSON }: { pkgJSON: PackageJson }): JSRJson {
	const { version } = pkgJSON;

	const include = getInclude(pkgJSON);
	const exclude = getExclude(pkgJSON);
	const jsr = {
		name: getName(pkgJSON),
		version: version as string,
		publish: include == null && exclude == null
			? undefined
			: {
					...((include?.length ?? 0) > 0 && { include }),
					...((exclude?.length ?? 0) > 0 && { exclude }),
				},
		exports: getExports(pkgJSON),
	} as const satisfies JSRJson;

	/* check the JSR object */
	const validation = typia.validateEquals<JSRJson>(jsr);

	const { data } = _typiaErrorHandler(validation);

	if (!semver.canParse(data.version)) {
		_throwError(`Invalid version: ${version}`);
	}

	return data;
}
