import typia from 'typia';
import { loadConfig as _loadConfig } from 'unconfig';
import type { PkgToJsrConfig } from './type';

/**
 * Define the configuration object
 * @param config - The configuration object
 * @returns The configuration object
 */
export function defineConfig(config: PkgToJsrConfig): PkgToJsrConfig {
	return config;
}

export async function loadConfig(): Promise<PkgToJsrConfig> {
	const { config } = await _loadConfig({
		sources: [
			{
				files: 'pkg.config',
			},
		],
	});

	/* check the configuration object */
	typia.assertGuard<PkgToJsrConfig>(config);

	return config;
}
