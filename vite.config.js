import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'ThreeAnimationPointer',
      fileName: (format) => `three-animation-pointer.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['three'],
      output: [
        {
          format: 'es',
          exports: 'named',
          entryFileNames: 'three-animation-pointer.es.js'
        },
        {
          format: 'umd',
          name: 'ThreeAnimationPointer',
          exports: 'named',
          globals: {
            'three': 'THREE'
          },
          entryFileNames: 'three-animation-pointer.umd.js'
        }
      ]
    },
    outDir: 'dist'
  }
});