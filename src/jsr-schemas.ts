import { z } from 'zod/v4-mini';

// Generated Zod schemas from JSR JSON Schema
export const JSRScopedNameSchema = z.string().regex(/^@[a-z0-9\-_]+\/[a-z0-9\-_]+$/);

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
export const isStartWithExclamation = (value: unknown): value is `!${string}` => 
	StartWithExclamationSchema.safeParse(value).success;

export const isString = (value: unknown): value is string => 
	StringSchema.safeParse(value).success;

export const isJSRScopedName = (value: unknown): value is JSRScopedName => 
	JSRScopedNameSchema.safeParse(value).success;
