import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: { compilerOptions: { declaration: true, declarationMap: true } },
  sourcemap: true,
  clean: true,
  treeshake: true,
  ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
});
