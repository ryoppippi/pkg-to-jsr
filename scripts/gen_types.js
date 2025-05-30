#!/usr/bin/env -S node

import fs from 'node:fs/promises';
import { consola } from 'consola';
import { compile } from 'json-schema-to-typescript';
import { resolve } from 'pathe';

const SCHEMA_URL = `https://jsr.io/schema/config-file.v1.json`;
const EXPORT_PATH = resolve(import.meta.dirname, '../src/jsr.ts');

/** @type {import('json-schema-to-typescript').JSONSchema} */
const json = await fetch(SCHEMA_URL).then(async res => res.json());

const ts = await compile(json, 'JSR');

await fs.writeFile(EXPORT_PATH, ts);

consola.success(`Generated types at ${EXPORT_PATH.toString()}`);
