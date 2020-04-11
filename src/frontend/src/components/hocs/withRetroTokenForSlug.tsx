import React from 'react';
import useSlug from '../../hooks/data/useSlug';
import useRetroToken from '../../hooks/data/useRetroToken';
import PasswordPage from '../password/PasswordPage';

interface ChildPropsT {
  slug: string;
  retroId: string | null;
  retroToken: string | null;
  retroTokenError: string | null;
}

type WrapperProps<P> = Omit<P, 'retroId' | 'retroToken' | 'retroTokenError'>;

export default <P extends ChildPropsT>(
  Component: React.ComponentType<P>,
) => ({ slug, ...params }: WrapperProps<P>): React.ReactElement => {
  const [retroId, slugError] = useSlug(slug);
  const [retroToken, tokenError] = useRetroToken(retroId);

  const error = slugError || tokenError;

  if (retroId && !retroToken && !error) {
    return (<PasswordPage slug={slug} retroId={retroId} />);
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
