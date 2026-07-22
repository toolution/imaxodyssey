import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    copyPublicDir: false,
    emptyOutDir: false,
    outDir: '.output/server',
    ssr: true,
    target: 'node22',
    rollupOptions: {
      input: {
        'init-rbac': 'scripts/init-rbac.ts',
        'migrate-db': 'scripts/migrate-db.ts',
      },
      external: [
        ...builtinModules,
        ...builtinModules.map((moduleName) => `node:${moduleName}`),
      ],
      output: {
        entryFileNames: '[name].mjs',
      },
    },
  },
});
