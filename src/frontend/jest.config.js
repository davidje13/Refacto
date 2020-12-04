const neutrino = require('neutrino');

//module.exports = neutrino().jest();

// TODO: waiting for https://github.com/neutrinojs/neutrino/pull/1651
const config = neutrino().jest();
config.moduleNameMapper = {
  '\\.svg$': config.moduleNameMapper['\\.svg$'],
  ...config.moduleNameMapper,
};
module.exports = config;
