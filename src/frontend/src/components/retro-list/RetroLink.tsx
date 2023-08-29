import React, { memo } from 'react';
import { Link } from 'wouter';

interface PropsT {
  name: string;
  slug: string;
}

export default memo(({ name, slug }: PropsT) => (
  <Link className="retro-link" to={`/retros/${slug}`}>
    {name}
  </Link>
));
