import { resolve } from 'pathe';
import { expect, it } from 'vitest';
import { findPackageJSON, genJsrFromPackageJson, readPkgJSON } from '../src';

it('basic', async () => {
	const DIR = resolve(__dirname, './basic/');
	const pkgJsonPath = await findPackageJSON({ cwd: DIR });
	const pkgJSON = await readPkgJSON(pkgJsonPath);
	const jsr = genJsrFromPackageJson({ pkgJSON });

	await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
});

it('without files', async () => {
	const DIR = resolve(__dirname, './without_files/');
	const pkgJsonPath = await findPackageJSON({ cwd: DIR });
	const pkgJSON = await readPkgJSON(pkgJsonPath);
	const jsr = genJsrFromPackageJson({ pkgJSON });

	await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
});

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
