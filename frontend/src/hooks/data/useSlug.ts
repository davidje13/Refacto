import { useAsyncValue } from '../useAsyncValue';
import { slugTracker } from '../../api/api';

export const useSlug = (slug: string | null) =>
  useAsyncValue(slug ? slugTracker.get(slug) : undefined);
