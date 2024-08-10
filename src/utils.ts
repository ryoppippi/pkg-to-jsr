import typia from 'typia';
import type { PackageJson } from 'pkg-types';
import consola from 'consola';
import type { Exports, JSR } from './type';

const isStartWithExclamation = typia.createIs<`!${string}`>();

export function getInclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;

	if (files == null) {
		return;
	}

	return files.filter(file => isStartWithExclamation(file));
}

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
 * the import path should be string, { source: string }, { import: string }
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
 *       "source": "./src/index.ts",
 *       "import": "./dist/index.js"
 *       "types": "./dist/index.d.ts"
 *     },
 *     "./sub": {
 *       "source": "./src/sub.ts"
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
				/* if source is defined, use it, otherwise use import */
				_exports[key] = value.source ?? value.import;
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
