// 운영 빌드: webpack → dist/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const babel = {
  loader: 'babel-loader',
  options: { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
};

export default {
  entry: './src/app/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/technote.[contenthash:8].js',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx', '.mdx'] },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: babel },
      {
        test: /\.mdx$/,
        use: [babel, { loader: '@mdx-js/loader', options: { providerImportSource: '@mdx-js/react' } }],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyWebpackPlugin({ patterns: [{ from: 'public', to: '.' }] }),
  ],
  devtool: 'source-map',
  performance: { hints: false },
};
