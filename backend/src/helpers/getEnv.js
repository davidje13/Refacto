export default function getEnv(name, def = null) {
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
