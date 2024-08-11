import { defineConfig } from 'vitest/config';
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';
import { doctest } from 'vite-plugin-doctest';

export default defineConfig({
  plugins: [
    UnpluginTypia({
      cache: false,
      log: 'verbose',
    }),
    doctest(),
  ],
  test: {
    includeSource: [
      './src/**/*.[jt]s',
      './tests/**/*.[jt]s',
    ],
  },
});
