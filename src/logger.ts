import type { SafeParseReturnType } from 'zod/v4-mini';
import process from 'node:process';
import { consola, type ConsolaInstance } from 'consola';

import { name } from '../package.json';

export const logger: ConsolaInstance = consola.withTag(name);

/**
 * Throw an error and exit the process
 * @internal
 */
export function _throwError(message: string): never {
	logger.error(message);
	if (process.env.NODE_ENV === 'test') {
		throw new Error(message);
	}
	process.exit(1);
}

/**
 * Handle zod validation error
 */
/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-member-access, ts/no-unsafe-call */
export function _zodErrorHandler<T>(validation: SafeParseReturnType<unknown, T>): { data: T } {
	if (validation.success === false) {
		const errorMessage = validation.error.errors.map((error) => {
			const { path, message, code } = error;
			return `${path.join('.')} is invalid: ${message} (${code})`;
		}).join('\n');
		_throwError(`Invalid configuration: ${errorMessage}`);
	}

	return { data: validation.data };
}
/* eslint-enable ts/no-unsafe-assignment, ts/no-unsafe-member-access, ts/no-unsafe-call */
