import { memo } from 'react';
import { Link } from 'wouter';
import { RetroFormatIcon } from '../retro-formats/RetroFormatIcon';

interface PropsT {
  name: string;
  slug: string;
  format: string;
}

export const RetroLink = memo(({ name, slug, format }: PropsT) => (
  <Link className="retro-link" to={`/retros/${encodeURIComponent(slug)}`}>
    <span className="name">{name}</span>
    <RetroFormatIcon format={format} />
  </Link>
));
