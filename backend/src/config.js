import baseConfig from './config/default.json';

// Reads configuration from environment variables (falling back to values in
// config/default.json if not set)
// Variables are read in snake_case and exported in camelCase

function getEnv(name, def = null) {
  const value = process.env[name];
  if (value === undefined) {
    return def;
  }
  if (typeof def === 'number') {
    const numValue = Number(value);
    if (Number.isNaN(numValue) || value === '') {
      return def;
    }
    return numValue;
  }
  return value;
}

function makeSnake(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1_$2');
}

function makeCamel(name) {
  return name.replace(/_(.)/g, (m, c) => c.toUpperCase());
}

function populateConfig(base, env = '') {
  if (!base || typeof base !== 'object') {
    return getEnv(env, base);
  }
  const envPrefix = env ? `${env}_` : '';

  const result = {};
  Object.keys(base).forEach((key) => {
    result[makeCamel(key)] = populateConfig(
      base[key],
      `${envPrefix}${makeSnake(key).toUpperCase()}`,
    );
  });
  return result;
}

export default populateConfig(baseConfig);
