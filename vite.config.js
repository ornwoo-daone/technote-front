import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';

// ⚠️ MDX 는 기본적으로 GFM 표를 파싱하지 않는다. remark-gfm 이 빠지면 마크다운 표가
// 파이프 문자 그대로 렌더된다. webpack 쪽(@mdx-js/loader)에도 똑같이 넣어야 한다.
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
  // React 셸이 쓰는 정적 자원은 repo 가 소유하는 static/ 에 둔다.
  // public/ 은 C:\htmls\dbx-guide 로의 junction(레거시 사이트)이라 빌드 입력으로 쓰지 않는다.
  publicDir: 'static',
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
