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
    ssr: 'scripts/init-rbac.ts',
    target: 'node22',
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((moduleName) => `node:${moduleName}`),
      ],
      output: {
        entryFileNames: 'init-rbac.mjs',
      },
    },
  },
});
