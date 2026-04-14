import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'integrations/zustand/index': 'src/integrations/zustand/index.ts',
    'integrations/react-query/index': 'src/integrations/react-query/index.ts',
  },
  format: ['cjs', 'esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'zustand'],
  jsx: 'react',
  injectStyle: true,
})
