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
      // ⚠️ development 를 명시하지 않으면 Babel 8 이 envName(BABEL_ENV || NODE_ENV || 'development')
      // 을 보고 개발용으로 판단해 `import { jsxDEV } from "react/jsx-dev-runtime"` 를 뽑는다.
      // 그런데 webpack production 은 react 의 «운영» jsx-dev-runtime 을 넣는데 거기엔
      // jsxDEV 가 undefined 다 → 화면이 통째로 안 뜬다(검정 화면). 빌드는 성공한다.
      // 이 webpack 설정은 운영 전용이므로 false 로 못박는다. NODE_ENV 에 의존하지 않는다.
      ['@babel/preset-react', { runtime: 'automatic', development: false }],
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
