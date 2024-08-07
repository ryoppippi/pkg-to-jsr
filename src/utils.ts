import typia from 'typia';
import type { PackageJson } from 'pkg-types';
import type { JSR, PkgToJsrConfig } from './type';

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
