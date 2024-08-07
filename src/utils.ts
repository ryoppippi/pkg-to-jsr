import typia from 'typia';
import type { PackageJson } from 'pkg-types';
import type { JSR, PkgToJsrConfig } from './type';

const isStartWithExclamation = typia.createIs<`!${string}`>();

export function getInclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;
	const include = files == null ? ['dist'] : files.filter(file => isStartWithExclamation(file));
	return include;
}

export function getExclude(pkgJSON: PackageJson): string[] | undefined {
	const { files } = pkgJSON;
	const exclude = files == null
		? undefined
		: files
			.filter(file => !isStartWithExclamation(file))
			.map((file) => {
				if (file.startsWith('!**/')) {
					return file.slice(4);
				}
				if (file.startsWith('!')) {
					return file.slice(1);
				}
				return file;
			});
	return exclude;
}

export function genJsrFromPkg({ pkgJSON, options }: { pkgJSON: PackageJson; options: PkgToJsrConfig }): JSR {
	const { name, version } = pkgJSON;
	const jsr = {
		name: name as string,
		version: version as string,
		publish: {
			include: getInclude(pkgJSON),
			exclude: getExclude(pkgJSON),
		},
		exports: options.exports,
	} as const satisfies JSR;

	/* check the JSR object */
	typia.assertEquals<JSR>(jsr);

	return jsr;
}
