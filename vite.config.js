import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'ThreeAnimationPointer',
      fileName: (format) => format === 'es' ? 'three-animation-pointer.js' : `three-animation-pointer.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['three'],
      output: {
        exports: 'named',
        globals: {
          'three': 'THREE'
        }
      }
    },
    outDir: 'dist'
  }
});