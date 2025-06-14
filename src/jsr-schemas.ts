import { z } from 'zod/v4-mini';

// Generated Zod schemas from JSR JSON Schema
export const JSRScopedNameSchema = z.string().check(
	z.regex(/^@[a-z0-9\-_]+\/[a-z0-9\-_]+$/),
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
	license: z.optional(z.string()),
	exports: JSRExportsSchema,
	publish: z.optional(JSRPublishSchema),
});

// Helper schemas for validation
export const StartWithExclamationSchema = z.string().check(
	z.regex(/^!/),
);
export const StringSchema = z.string();

// Package.json schema for validation (passthrough for now)
export const PackageJsonSchema = z.unknown();

// Type inference from schemas
export type JSRScopedName = z.infer<typeof JSRScopedNameSchema>;
export type JSRJson = z.infer<typeof JSRConfigurationSchema>;
export type PackageJson = {
	name?: string;
	author?: string | { name: string };
	files?: string[];
	exports?: string | Record<string, unknown>;
	version?: string;
	jsrName?: string;
	jsrInclude?: string[];
	jsrExclude?: string[];
};

// Validation helpers
export function isStartWithExclamation(value: unknown): value is `!${string}` {
	return StartWithExclamationSchema.safeParse(value).success;
}

export function isString(value: unknown): value is string {
	return StringSchema.safeParse(value).success;
}

export function isJSRScopedName(value: unknown): value is JSRScopedName {
	return JSRScopedNameSchema.safeParse(value).success;
}
