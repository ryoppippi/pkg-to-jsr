import fs from 'node:fs/promises';
import { minify } from '@swc/core';
import { consola } from 'consola';
import fg from 'fast-glob';
import { resolve } from 'pathe';

const dist = (resolve(import.meta.dirname, '../dist'));

/* read all ".js" files in the "dist" folder */
const files = await fg('**/*.js', { cwd: dist, absolute: true });

consola.info(`Minifying ${files.length} files...`);

const originalSizes = [];
const minifiedSizes = [];

/* minify each file */
for (const file of files) {
	const code = await fs.readFile(file, 'utf-8');
	const originalSize = code.length;
	try {
		const minified = await minify(code, {
			compress: true,
			mangle: true,
			sourceMap: false,
			module: true,
		});
		const minifiedSize = minified.code.length;

		if (minifiedSize >= originalSize) {
			consola.warn(`Failed to minify ${file}. Skipping...`);
			continue;
		}
		originalSizes.push(originalSize);
		minifiedSizes.push(minifiedSize);
		await fs.writeFile(file, minified.code);
	}
	catch (e) {
		console.error(file, e);
	}
}

const totalOriginalSize = originalSizes.reduce((a, b) => a + b, 0);
const totalMinifiedSize = minifiedSizes.reduce((a, b) => a + b, 0);

if (totalOriginalSize > totalMinifiedSize) {
	const saved = totalOriginalSize - totalMinifiedSize;
	const percent = ((saved / totalOriginalSize) * 100).toFixed(2);
	consola.success(`Minified ${minifiedSizes.length} files. Saved ${saved} bytes (${percent}%)`);
}
else {
	consola.warn(`Total minified size increased: ${totalOriginalSize} -> ${totalMinifiedSize}`);
}
