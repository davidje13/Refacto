import { CollectionStorage } from 'collection-storage';

CollectionStorage.dynamic([
  ['dynamodb', () => import('@collection-storage/dynamodb')],
  ['mongodb', () => import('@collection-storage/mongodb')],
  ['mongodb+srv', () => import('@collection-storage/mongodb')],
  ['postgresql', () => import('@collection-storage/postgresql')],
  ['redis', () => import('@collection-storage/redis')],
  ['rediss', () => import('@collection-storage/redis')],
  ['sqlite', () => import('@collection-storage/sqlite')],
]);
