import React, { memo } from 'react';
import type { RetroSummary } from 'refacto-entities';
import RetroLink from './RetroLink';

interface PropsT {
  retros: RetroSummary[];
}

export default memo(({
  retros,
}: PropsT) => {
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
});
