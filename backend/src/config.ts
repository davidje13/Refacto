import baseConfig from './config/default.json';

// Reads configuration from environment variables (falling back to values in
// config/default.json if not set)
// Variables are read in UPPER_SNAKE_CASE and exported in camelCase

function getEnv(name: string, def: null): string | null;
function getEnv<T>(name: string, def: T): T;

function getEnv(name: string, def: any): any {
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

function makeSnake(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1_$2');
}

function makeCamel(name: string): string {
  return name.replace(/_(.)/g, (m, c): string => c.toUpperCase());
}

function populateConfig<T>(base: T, env = ''): T {
  if (!base || typeof base !== 'object') {
    return getEnv(env, base);
  }
  const envPrefix = env ? `${env}_` : '';

  const result: T = base;
  Object.keys(base).forEach((key): void => {
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

export default populateConfig(baseConfig);
