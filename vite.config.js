import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 서버: Vite
//  - public/ 은 C:\htmls\dbx-guide junction — 기존 사이트가 그대로 서빙된다
//  - public 파일이 바뀌면 Vite가 페이지를 자동 리로드 (serve_guide.py 없이도 동작)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: '/dbx-guide.html',
  },
});
