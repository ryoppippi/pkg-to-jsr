#!/usr/bin/env -S node

import fs from 'node:fs/promises';
import { consola } from 'consola';
import { resolve } from 'pathe';

const SCHEMA_URL = `https://jsr.io/schema/config-file.v1.json`;
const EXPORT_PATH = resolve(import.meta.dirname, '../src/jsr-schemas.ts');

/**
 * Convert JSON Schema type to Zod schema
 */
function jsonSchemaToZod(schema, name = 'Schema') {
	if (schema.type === 'string') {
		let zodString = 'z.string()';
		if (schema.pattern) {
			zodString += `.regex(/${schema.pattern}/)`;
		}
		return zodString;
	}
	
	if (schema.type === 'array') {
		const itemSchema = jsonSchemaToZod(schema.items || { type: 'unknown' });
		let result = `z.array(${itemSchema})`;
		if (!schema.required || !schema.required.includes(name)) {
			result += '.optional()';
		}
		return result;
	}
	
	if (schema.type === 'object') {
		const properties = schema.properties || {};
		const required = schema.required || [];
		
		const props = Object.entries(properties).map(([key, prop]) => {
			const isRequired = required.includes(key);
			const propSchema = jsonSchemaToZod(prop, key);
			return `\t${key}: ${propSchema}${isRequired ? '' : '.optional()'}`;
		}).join(',\n');
		
		let result = `z.object({\n${props}\n})`;
		if (schema.additionalProperties !== false) {
			result += '.catchall(z.unknown())';
		}
		return result;
	}
	
	if (schema.oneOf || schema.anyOf) {
		const options = (schema.oneOf || schema.anyOf).map(option => jsonSchemaToZod(option));
		return `z.union([${options.join(', ')}])`;
	}
	
	if (schema.enum) {
		const enumValues = schema.enum.map(val => JSON.stringify(val)).join(', ');
		return `z.enum([${enumValues}])`;
	}
	
	// Fallback for unknown types
	return 'z.unknown()';
}

/**
 * Generate Zod schemas from JSR JSON Schema
 */
async function generateZodSchemas() {
	consola.info('Fetching JSR schema...');
	const response = await fetch(SCHEMA_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
	}
	
	const jsonSchema = await response.json();
	consola.success('JSR schema fetched successfully');
	
	// Create specific schemas manually for better control
	const schemas = `import { z } from 'zod/v4-mini';

// Generated Zod schemas from JSR JSON Schema
export const JSRScopedNameSchema = z.string().regex(/^@[a-z0-9\\-_]+\\/[a-z0-9\\-_]+$/);

export const JSRExportsSchema = z.union([
	z.string(),
	z.record(z.string(), z.string())
]);

export const JSRPublishSchema = z.object({
	include: z.array(z.string()).optional(),
	exclude: z.array(z.string()).optional()
}).catchall(z.unknown());

export const JSRConfigurationSchema = z.object({
	name: JSRScopedNameSchema,
	version: z.string().optional(),
	license: z.string().optional(),
	exports: JSRExportsSchema,
	publish: JSRPublishSchema.optional()
}).catchall(z.unknown());

// Helper schemas for validation
export const StartWithExclamationSchema = z.string().regex(/^!/);
export const StringSchema = z.string();

// Package.json schema for validation
export const PackageJsonSchema = z.object({
	name: z.string().optional(),
	author: z.union([z.string(), z.object({ name: z.string() })]).optional(),
	files: z.array(z.string()).optional(),
	exports: z.union([z.string(), z.record(z.unknown())]).optional(),
	version: z.string().optional(),
	jsrName: z.string().optional(),
	jsrInclude: z.array(z.string()).optional(),
	jsrExclude: z.array(z.string()).optional()
}).catchall(z.unknown());

// Type inference from schemas
export type JSRScopedName = z.infer<typeof JSRScopedNameSchema>;
export type JSRJson = z.infer<typeof JSRConfigurationSchema>;
export type PackageJson = z.infer<typeof PackageJsonSchema>;

// Validation helpers
export const isStartWithExclamation = (value: unknown): value is \`!\${string}\` => 
	StartWithExclamationSchema.safeParse(value).success;

export const isString = (value: unknown): value is string => 
	StringSchema.safeParse(value).success;

export const isJSRScopedName = (value: unknown): value is JSRScopedName => 
	JSRScopedNameSchema.safeParse(value).success;
`;

	await fs.writeFile(EXPORT_PATH, schemas);
	consola.success(`Generated Zod schemas at ${EXPORT_PATH}`);
}

// Run the generator
generateZodSchemas().catch((error) => {
	consola.error('Failed to generate Zod schemas:', error);
	process.exit(1);
});