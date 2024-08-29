import { resolve } from 'pathe';
import { describe, expect, it } from 'vitest';
import { findPackageJSON, genJsrFromPackageJson, readPkgJSON } from '../src';

it('basic', async () => {
	const DIR = resolve(__dirname, './basic/');
	const pkgJsonPath = await findPackageJSON({ cwd: DIR });
	const pkgJSON = await readPkgJSON(pkgJsonPath);
	const jsr = genJsrFromPackageJson({ pkgJSON });

	await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
});

describe('files test', () => {
	it('without files', async () => {
		const DIR = resolve(__dirname, './files_without_files/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('includes', async () => {
		const DIR = resolve(__dirname, './files_includes');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('excludes', async () => {
		const DIR = resolve(__dirname, './files_excludes');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});
});

describe('name test', () => {
	it('gen name', async () => {
		const DIR = resolve(__dirname, './gen_name/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('jsr name', async () => {
		const DIR = resolve(__dirname, './jsrName/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('error caused name', async () => {
		const DIR = resolve(__dirname, './error_caused_name_field/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		expect(() => genJsrFromPackageJson({ pkgJSON })).toThrowError();
	});
});
