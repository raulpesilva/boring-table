import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2020',
  outDir: 'dist',
  fixedExtension: true,
  dts: {
    cjsReexport: true,
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: true,
  },
  publint: {
    level: 'error',
  },
  attw: {
    profile: 'node16',
    level: 'error',
  },
  failOnWarn: true,
});
