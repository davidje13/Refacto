import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import {
  SlugAvailability,
  useSlugAvailability,
} from '../../hooks/data/useSlugAvailability';
import { SlugEntry } from '../retro-create/SlugEntry';

export const RetroNavigationForm = () => {
  const [, setLocation] = useLocation();
  const [slug, setSlug] = useState('');
  const slugAvailability = useSlugAvailability(slug);
  const allowSlugNav =
    slugAvailability === SlugAvailability.TAKEN ||
    slugAvailability === SlugAvailability.FAILED;

  const go = (e: FormEvent) => {
    e.preventDefault();
    setLocation(`/retros/${encodeURIComponent(slug)}`);
  };

  return (
    <form className="global-form" onSubmit={go}>
      <div className="horizontal">
        <label>
          <SlugEntry
            value={slug}
            onChange={setSlug}
            ariaLabel="Enter a retro ID to open"
          />
        </label>
        <button type="submit" className="wide-button" disabled={!allowSlugNav}>
          Go
        </button>
      </div>
    </form>
  );
};
