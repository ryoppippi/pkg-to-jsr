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

// Add zod-mini schemas to the generated types
const zodSchemas = `
import { z } from 'zod/v4-mini';

// Zod schemas for runtime validation
export const JSRScopedNameSchema = z.string().check(
  z.regex(/^@[a-z0-9\\-_]+\\/[a-z0-9\\-_]+$/),
);

export const JSRExportsSchema = z.union([
  z.string(),
  z.record(z.string(), z.string()),
]);

export const JSRPublishSchema = z.object({
  include: z.optional(z.array(z.string())),
  exclude: z.optional(z.array(z.string())),
});

export const JSRConfigurationSchema = z.object({
  name: JSRScopedNameSchema,
  version: z.optional(z.string()),
  exports: JSRExportsSchema,
  publish: z.optional(JSRPublishSchema),
});

// Helper schemas for validation
export const StartWithExclamationSchema = z.string().check(
  z.regex(/^!/),
);

export const StringSchema = z.string();

// Type inference from schemas
export type JSRScopedName = z.infer<typeof JSRScopedNameSchema>;
export type JSRJson = z.infer<typeof JSRConfigurationSchema>;
`;

const finalContent = ts + zodSchemas;

await fs.writeFile(EXPORT_PATH, finalContent);

consola.success(`Generated types with zod schemas at ${EXPORT_PATH.toString()}`);
