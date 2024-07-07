import { defineConfig } from "vite";
import { resolve } from "path";
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'html2pptx',
      fileName: 'html2pptx',
    },
    minify: false,
  },
  plugins: [
    externalizeDeps({
      deps: true,
      devDeps: false,
      nodeBuiltins: true,
      optionalDeps: true,
      peerDeps: true,
    }),
  ],
})