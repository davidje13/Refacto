// this config is only used by Jest - see webpack.config.js for babel config for the build

module.exports = {
  presets: ['@babel/preset-typescript'],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ['@babel/plugin-transform-dynamic-import'],
    ['@babel/plugin-transform-modules-commonjs', { importInterop: 'babel' }],
  ],
};
