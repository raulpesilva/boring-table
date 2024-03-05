import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: { compilerOptions: { declaration: true, declarationMap: true } },
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  shims: true,
  ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
});