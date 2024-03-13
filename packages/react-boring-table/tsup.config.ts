import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts'],
  format: ['cjs', 'esm'],
  dts: { compilerOptions: { declaration: true, declarationMap: true } },
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react'],
  ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
});
