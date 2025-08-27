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
      output: {
        globals: {
          'three': 'THREE'
        }
      }
    },
    outDir: 'dist'
  }
});