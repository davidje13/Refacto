import React from 'react';
import { Link } from 'wouter';

interface PropsT {
  name: string;
  slug: string;
}

const RetroLink = ({ name, slug }: PropsT): React.ReactElement => (
  <Link className="retro-link" to={`/retros/${slug}`}>{ name }</Link>
);

export default React.memo(RetroLink);
