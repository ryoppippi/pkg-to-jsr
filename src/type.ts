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

export type PkgToJsrConfig = {
	exports: Exports;
};
