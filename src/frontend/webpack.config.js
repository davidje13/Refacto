const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { join } = require('node:path');

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
  loader: join(__dirname, 'loaders', 'svgr.js'),
  options: { titleProp: true },
};

module.exports = (env, argv) => ({
  target: 'web',
  context: __dirname,
  devtool: argv.mode === 'production' ? undefined : 'source-map',
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
    assetModuleFilename: '[name].[contenthash:8][ext][query]',
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
      favicon: 'resources/favicon.png',
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
    port: process.env.PORT || 5000,
    host: 'localhost',
    static: join(__dirname, 'resources', 'static'),
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    magicHtml: false,
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
