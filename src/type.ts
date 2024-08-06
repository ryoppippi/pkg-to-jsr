export type JSR = {
	name: string;
	version: string;
	publish: {
		include: string[] | undefined;
		exclude: string[] | undefined;
	};
	exports: Record<string, string> | string;
};
