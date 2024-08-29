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

describe('exports', () => {
	it('exports_with_jsr', async () => {
		const DIR = resolve(__dirname, './exports_with_jsr/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('exprts_without_jsr', async () => {
		const DIR = resolve(__dirname, './exports_without_jsr/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('exports_without_jsr_imports_object', async () => {
		const DIR = resolve(__dirname, './exports_without_jsr_imports_object/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});
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
		const DIR = resolve(__dirname, './name_gen_name/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('jsr name', async () => {
		const DIR = resolve(__dirname, './name_jsrName/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		const jsr = genJsrFromPackageJson({ pkgJSON });

		await expect(JSON.stringify(jsr, null, '\t')).toMatchFileSnapshot(`${DIR}/jsr.json`);
	});

	it('error caused name', async () => {
		const DIR = resolve(__dirname, './name_error_caused_name_field/');
		const pkgJsonPath = await findPackageJSON({ cwd: DIR });
		const pkgJSON = await readPkgJSON(pkgJsonPath);
		expect(() => genJsrFromPackageJson({ pkgJSON })).toThrowError();
	});
});
