#!/usr/bin/env -S node

import { $ } from 'dax-sh';
import { resolve } from 'pathe';
import { compile } from 'json-schema-to-typescript';
import { consola } from 'consola';

const SCHEMA_URL = `https://jsr.io/schema/config-file.v1.json`;
const EXPORT_PATH = $.path(resolve(import.meta.dirname, '../src/jsr.d.ts'));

/** @type {import('json-schema-to-typescript').JSONSchema} */
const json = await fetch(SCHEMA_URL).then(async res => res.json());

const ts = await compile(json, 'JSR');

await $`echo ${ts} > ${EXPORT_PATH}`;

consola.success(`Generated types at ${EXPORT_PATH.toString()}`);
