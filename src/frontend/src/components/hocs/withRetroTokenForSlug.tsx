import React from 'react';
import useSlug from '../../hooks/data/useSlug';
import useRetroToken from '../../hooks/data/useRetroToken';
import PasswordPage from '../password/PasswordPage';

interface InputPropsT {
  slug: string | null;
}

type Unwrapped<P> = Omit<P, 'retroId' | 'retroToken' | 'retroTokenError'>;

export default function withRetroTokenForSlug<P extends InputPropsT>(
  Component: React.ComponentType<P>,
): React.ComponentType<Unwrapped<P>> {
  const Wrapped = ({ slug, ...params }: Unwrapped<P>): React.ReactElement => {
    const [retroId, slugError] = useSlug(slug);
    const [retroToken, tokenError] = useRetroToken(retroId);

    const error = slugError || tokenError;

    if (retroId && !retroToken && !error) {
      return (<PasswordPage slug={slug!} retroId={retroId} />);
    }

    const AnyComponent = Component as React.ComponentType<any>;
    return (
      <AnyComponent
        slug={slug}
        retroId={retroId}
        retroToken={retroToken}
        retroTokenError={error}
        {...params}
      />
    );
  };

  return Wrapped;
}
