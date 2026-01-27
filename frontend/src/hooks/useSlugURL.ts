import { useEffect } from 'react';
import { useLocation } from 'wouter';
import type { Retro } from '../shared/api-entities';
import { slugTracker } from '../api/api';
import { useEvent } from './useEvent';

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/.*)/;

export const useSlugURL = (retro: Retro<unknown> | undefined) => {
  const [location, setLocation] = useLocation();

  const updateSlug = useEvent((slug: string) => {
    const old = RETRO_SLUG_PATH.exec(location);
    const oldSlug = decodeURIComponent(old?.[1] ?? '');
    if (!retro?.id || !oldSlug || oldSlug === slug) {
      return;
    }
    slugTracker.remove(oldSlug);
    slugTracker.set(slug, retro.id);
    setLocation(`/retros/${encodeURIComponent(slug)}${old?.[2] ?? ''}`, {
      replace: true,
    });
  });

  const slug = retro?.slug;
  useEffect(() => {
    if (slug) {
      updateSlug(slug);
    }
  }, [slug, updateSlug]);
};
