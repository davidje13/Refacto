import React from 'react';
import { Link } from 'wouter';

interface PropsT {
  name: string;
  slug: string;
}

const RetroLink = ({ name, slug }: PropsT): React.ReactElement => (
  <Link to={`/retros/${slug}`}>
    <div className="retro-link">{ name }</div>
  </Link>
);

export default React.memo(RetroLink);
