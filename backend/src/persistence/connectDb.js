import InMemoryDb from './InMemoryDb';
import MongoDb from './MongoDb';

export default async function connectDb({ url }) {
  try {
    if (url.startsWith('memory')) {
      return InMemoryDb.connect(url);
    }
    if (url.startsWith('mongodb')) {
      return await MongoDb.connect(url);
    }
  } catch (e) {
    throw new Error(`Failed to connect to database: ${e.message}`);
  }

  throw new Error(`Unknown database connection string: ${url}`);
}
