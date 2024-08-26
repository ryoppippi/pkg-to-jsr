import { defineConfig } from 'tsdown';
import UnpluginTypia from '@ryoppippi/unplugin-typia/rolldown'

export default defineConfig({
  entry: ['./src/*.ts'],
  format: 'esm',
  clean: true,
  platform: 'node',
  dts: true,
  minify: false,
  plugins: [
    UnpluginTypia({ cache: false, log: 'verbose' }),
  ]
})
