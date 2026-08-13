// 운영 빌드: webpack → dist/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import remarkGfm from 'remark-gfm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const babel = {
  loader: 'babel-loader',
  options: {
    presets: [
      ['@babel/preset-react', { runtime: 'automatic' }],
      // 타입 제거만 담당 (타입 검사는 npm run typecheck)
      '@babel/preset-typescript',
    ],
  },
};

export default {
  entry: './src/app/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/technote.[contenthash:8].js',
    clean: true,
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.mdx'] },
  module: {
    rules: [
      { test: /\.[jt]sx?$/, exclude: /node_modules/, use: babel },
      {
        // ⚠️ remark-gfm 이 빠지면 마크다운 표가 파이프 문자 그대로 렌더된다.
        // vite.config.js(@mdx-js/rollup) 쪽과 반드시 같은 플러그인 목록을 유지할 것.
        test: /\.mdx$/,
        use: [babel, {
          loader: '@mdx-js/loader',
          options: { remarkPlugins: [remarkGfm], providerImportSource: '@mdx-js/react' },
        }],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    // repo 가 소유하는 static/ 만 복사한다. public/ 은 레거시 사이트로의 junction 이라
    // 빌드 입력에서 제외 (→ .claude/rules/build.md)
    new CopyWebpackPlugin({ patterns: [{ from: 'static', to: '.' }] }),
  ],
  devtool: 'source-map',
  performance: { hints: false },
};
