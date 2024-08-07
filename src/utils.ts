import typia from 'typia';
import type { PackageJson } from 'pkg-types';
import { parse } from 'pathe';

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
