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
