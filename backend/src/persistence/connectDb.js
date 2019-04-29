import InMemoryDb from './InMemoryDb';
import MongoDb from './MongoDb';

export default async function connectDb(config, simulatedDelay = 0) {
  const target = config.url;
  try {
    if (!target) {
      return new InMemoryDb(simulatedDelay);
    }
    if (target.startsWith('mongodb')) {
      return await MongoDb.connect(config);
    }
  } catch (e) {
    throw new Error(`Failed to connect to database: ${e.message}`);
  }

  throw new Error(`Unknown database connection string: ${target}`);
}
