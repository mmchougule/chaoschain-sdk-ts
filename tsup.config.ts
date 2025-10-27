import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/storage/index': 'src/providers/storage/index.ts',
    'providers/compute/index': 'src/providers/compute/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['@pinata/sdk', '@irys/sdk', 'ipfs-http-client']
});

