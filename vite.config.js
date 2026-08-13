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
    // 포트가 밀리면 조용히 5174, 5175… 로 옮겨간다. 그런데 localStorage 는 포트까지
    // 포함한 origin 단위로 분리되므로, 포트가 바뀌면 저장한 테마·읽음 기록이 «사라진 것처럼»
    // 보인다. 그래서 밀려나지 말고 실패하게 둔다 — 이미 떠 있는 서버를 쓰라는 신호다.
    strictPort: true,
    open: '/',
  },
  test: {
    // localStorage 를 쓰는 read-tracking 테스트 때문에 jsdom 이 필요하다
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
