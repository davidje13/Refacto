import baseConfig from './config/default.json';

// Reads configuration from environment variables (falling back to values in
// config/default.json if not set)
// Variables are read in UPPER_SNAKE_CASE and exported in camelCase

function getEnv<T>(name: string, def: T): T {
  const value = process.env[name];
  if (value === undefined) {
    return def;
  }
  delete process.env[name];
  if (typeof def === 'boolean') {
    const lower = value.toLowerCase();
    if (
      lower === 'true' ||
      lower === 'yes' ||
      lower === 'on' ||
      lower === '1'
    ) {
      return true as T & boolean;
    }
    if (
      lower === 'false' ||
      lower === 'no' ||
      lower === 'off' ||
      lower === '0' ||
      lower === ''
    ) {
      return false as T & boolean;
    }
    throw new Error(`Invalid value for ${name} (expected a boolean)`);
  }
  if (typeof def === 'number') {
    if (value === '') {
      return def;
    }
    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      throw new Error(`Invalid value for ${name} (expected a number)`);
    }
    return numValue as T & number;
  }
  if (typeof def === 'string') {
    return value as T & string;
  }
  throw new Error(`Unknown data type for ${name}`);
}

function makeSnake(name: string) {
  return name.replace(/([a-z])([A-Z])/g, '$1_$2');
}

function makeCamel(name: string) {
  return name.replace(/_(.)/g, (_, c): string => c.toUpperCase());
}

function populateConfig<T>(base: T, env = ''): T {
  if (!base || typeof base !== 'object') {
    return getEnv(env, base);
  }
  const envPrefix = env ? `${env}_` : '';

  const result: T = base;
  Object.keys(base).forEach((key) => {
    if (makeCamel(key) !== key) {
      throw new Error(`Property ${key} should be camel case`);
    }
    result[key as keyof T] = populateConfig(
      base[key as keyof T],
      `${envPrefix}${makeSnake(key).toUpperCase()}`,
    );
  });
  return result;
}

export const config = populateConfig(baseConfig);

export type ConfigT = typeof config;
