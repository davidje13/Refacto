import React from 'react';
import type { RetroSummary } from 'refacto-entities';
import RetroLink from './RetroLink';

interface PropsT {
  retros: RetroSummary[];
}

const RetroList = ({ retros }: PropsT): React.ReactElement => {
  if (!retros.length) {
    return (
      <p>You do not have any retros yet!</p>
    );
  }

  return (
    <ul className="retros">
      { retros.map(({ id, slug, name }) => (
        <li key={id}>
          <RetroLink name={name} slug={slug} />
        </li>
      )) }
    </ul>
  );
};

export default React.memo(RetroList);
