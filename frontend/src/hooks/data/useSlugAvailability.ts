import useAwaited from 'react-hook-awaited';
import { slugTracker } from '../../api/api';

export const MAX_SLUG_LENGTH = 64;
export const VALID_SLUG_PATTERN = '^[a-z0-9][a-z0-9_\\-]*$';
const VALID_SLUG = new RegExp(VALID_SLUG_PATTERN);

export function makeValidSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/[-_]{2,}/g, '_')
    .replace(/^[-_]+/g, '')
    .substring(0, MAX_SLUG_LENGTH)
    .replace(/[-_]+$/g, '');
}

export enum SlugAvailability {
  BLANK,
  PENDING,
  FAILED,
  INVALID,
  TAKEN,
  AVAILABLE,
}

export function useSlugAvailability(
  slug: string,
  oldValue?: string,
): SlugAvailability {
  const slugAvailability = useAwaited<SlugAvailability>(async () => {
    if (slug === '') {
      return SlugAvailability.BLANK;
    }
    if (slug === oldValue) {
      return SlugAvailability.AVAILABLE;
    }
    if (!VALID_SLUG.test(slug) || slug.length > MAX_SLUG_LENGTH) {
      return SlugAvailability.INVALID;
    }
    if (!(await slugTracker.isAvailable(slug))) {
      return SlugAvailability.TAKEN;
    }
    return SlugAvailability.AVAILABLE;
  }, [slug, slugTracker, oldValue]);

  switch (slugAvailability.state) {
    case 'pending':
      return SlugAvailability.PENDING;
    case 'rejected':
      return SlugAvailability.FAILED;
    case 'resolved':
      return slugAvailability.data;
  }
}
