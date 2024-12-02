import { memo } from 'react';
import { Link } from 'wouter';

interface PropsT {
  name: string;
  slug: string;
}

export const RetroLink = memo(({ name, slug }: PropsT) => (
  <Link className="retro-link" to={`/retros/${encodeURIComponent(slug)}`}>
    {name}
  </Link>
));
