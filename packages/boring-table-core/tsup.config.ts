import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  shims: true,
  legacyOutput: true,
  ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
});
