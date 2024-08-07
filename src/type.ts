export type Exports = Record<string, string> | string;

export type JSR = {
	name: string;
	version: string;
	publish: {
		include: string[] | undefined;
		exclude: string[] | undefined;
	};
	exports: Exports;
};

/**
 * The configuration object
 */
export type PkgToJsrConfig = {
	/**
	 * The exports object
	 *
	 * @example
	 * ```typescript
	 * {
	 *   ".": "./src/index.ts",
	 *   "./lib": "./src/lib.ts",
	 * }
	 * ```
	 */
	exports: Exports;

	/**
	 * The root directory
	 * @default "."
	 */
	rootDir?: string;
};
