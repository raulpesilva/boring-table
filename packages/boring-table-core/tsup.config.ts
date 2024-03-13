import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts'],
  format: ['cjs', 'esm'],
  dts: { compilerOptions: { declaration: true, declarationMap: true } },
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  treeshake: true,
  ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
});
