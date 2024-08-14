import process from 'node:process';
import { type ConsolaInstance, consola } from 'consola';
import type * as typia from 'typia';

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
 * Handle typia validation error
 */
export function _typiaErrorHandler<T>(validation: typia.IValidation<T>): never | typia.IValidation.ISuccess<T> {
	if (!validation.success) {
		const message = validation.errors.map(({ path, expected, value }) =>
			`${path} is invalid. Ecpected type is ${expected}, but got ${value}`,
		).join('\n');
		return _throwError(`Invalid JSR configuration: ${message}`);
	}

	return validation;
}
