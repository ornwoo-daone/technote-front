import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
  server: {
    port: 5173,
    open: '/',
  },
  test: {
    // localStorage 를 쓰는 read-tracking 테스트 때문에 jsdom 이 필요하다
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
