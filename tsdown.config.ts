import { defineConfig } from 'tsdown';
import UnpluginTypia from '@ryoppippi/unplugin-typia/rolldown'

// TODO: minify config
export default defineConfig({
  entry: ['./src/*.ts'],
  format: 'esm',
  clean: true,
  platform: 'node',
  dts: true,
  external: ['pathe', 'consola'],
  plugins: [
    UnpluginTypia({ cache: false, log: 'verbose' }),
  ]
})
