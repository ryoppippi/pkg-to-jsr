import { $ } from 'bun'
import { resolve } from 'pathe'
import { compile } from 'json-schema-to-typescript';
import { consola } from 'consola';

const SCHEMA_URL = `https://jsr.io/schema/config-file.v1.json`;
const EXPORT_PATH = resolve(__dirname, '../src/jsr.d.ts');

const json = await fetch(SCHEMA_URL).then(res => res.json());

const ts = await compile(json, 'JSR');

await $`echo ${ts} > ${EXPORT_PATH}`;

consola.success(`Generated types at ${EXPORT_PATH}`);
