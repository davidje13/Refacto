// This config is only used by Jest - see webpack.config.mjs for babel config for the build

// This file cannot be .mjs because Jest is unable to load it asynchronously;
// See https://github.com/babel/babel-loader/issues/824

module.exports = {
  presets: [['@babel/preset-typescript', { allowDeclareFields: true }]],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ['@babel/plugin-transform-dynamic-import'],
    ['@babel/plugin-transform-modules-commonjs', { importInterop: 'babel' }],
  ],
};
