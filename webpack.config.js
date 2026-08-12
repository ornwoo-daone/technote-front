// 운영 빌드: webpack → dist/
//  - src/ React 번들 + index.html 생성
//  - public/(기존 사이트)을 dist/ 로 그대로 복사
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/technote.[contenthash:8].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: '.', info: { minimized: true } }],
    }),
  ],
  devtool: 'source-map',
  performance: { hints: false },
};
