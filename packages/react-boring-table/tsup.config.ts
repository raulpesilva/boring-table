import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    target: ['es2020', 'node16'],
    outDir: 'build/legacy',
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['react'],
    ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  },
  {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
    outDir: 'build/modern',
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['react'],
    ignoreWatch: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  },
]);
