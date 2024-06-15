import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';

const basedir = dirname(fileURLToPath(import.meta.url));

const babelLoader = {
  loader: 'babel-loader',
  options: {
    configFile: false,
    presets: ['@babel/preset-typescript'],
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
  },
};

const lessLoader = {
  loader: 'less-loader',
  options: { lessOptions: { math: 'strict', strictUnits: true } },
};

const svgrLoader = {
  loader: join(basedir, 'webpack-loaders', 'svgr.mjs'),
  options: { titleProp: true },
};

export default (env, argv) => ({
  target: 'web',
  context: basedir,
  devtool: argv.mode === 'production' ? undefined : 'source-map',
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: join(basedir, 'build'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
    assetModuleFilename: '[name].[contenthash:8][ext][query]',
    trustedTypes: {
      policyName: 'dynamic-import',
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        use: [babelLoader],
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', lessLoader],
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        issuer: /\.[jt]sx?$/,
        use: [babelLoader, svgrLoader],
      },
      {
        test: /\.png$/,
        exclude: /node_modules/,
        type: 'asset/inline',
      },
      {
        test: /\.woff2?$/,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        issuer: /\.less$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Refacto',
      template: 'resources/html-template.ejs',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: 'resources/static',
          from: '{.well-known/**/*,**/*}',
          to: '.',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
    }),
  ],
  optimization: {
    splitChunks: { chunks: 'all' },
    runtimeChunk: 'single',
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          compress: {
            passes: 2,
          },
          keep_classnames: false,
          keep_fnames: false,
          mangle: true,
        },
      }),
      new CssMinimizerWebpackPlugin(),
    ],
  },
  devServer: {
    port: process.env['PORT'] || 5000,
    host: 'localhost',
    static: join(basedir, 'resources', 'static'),
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    webSocketServer: false,
    open: false,
    client: {
      overlay: false,
      progress: false,
      reconnect: false,
    },
  },
  stats: {
    preset: process.env['BUNDLE_ANALYSIS'] ? undefined : 'minimal',
  },
});
