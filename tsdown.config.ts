import { defineConfig } from 'tsdown';
import UnpluginTypia from '@ryoppippi/unplugin-typia/rolldown'
import { dependencies } from './package.json';

const external = Object.keys(dependencies);

// TODO: minify config
export default defineConfig({
  entry: ['./src/*.ts'],
  format: 'esm',
  clean: true,
  platform: 'node',
  dts: true,
  minify: false,
  external,
  plugins: [
    UnpluginTypia({ cache: false, log: 'verbose' }),
  ]
})
