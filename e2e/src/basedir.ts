// This file exists to work around a bug in webpack:
// https://github.com/webpack/webpack/issues/4303

// (without this hack, it is impossible to get a consistent
// relative __dirname in any non-root-directory script)

const basedir = __dirname;
export default basedir;
