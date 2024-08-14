import { consola, type ConsolaInstance } from 'consola';
import { name } from '../package.json';

export const logger: ConsolaInstance = consola.withTag(name);
