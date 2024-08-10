import { $ } from 'dax-sh';
import { resolve } from 'pathe';
import type { JSONSchema } from 'json-schema-to-typescript';
import { compile } from 'json-schema-to-typescript';
import { consola } from 'consola';

const SCHEMA_URL = `https://jsr.io/schema/config-file.v1.json`;
const EXPORT_PATH = $.path(resolve(__dirname, '../src/jsr.d.ts'));

const json = await fetch(SCHEMA_URL).then(async res => res.json() as unknown);

const ts = await compile(json as JSONSchema, 'JSR');

await $`echo ${ts} > ${EXPORT_PATH}`;

consola.success(`Generated types at ${EXPORT_PATH.toString()}`);
