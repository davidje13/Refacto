import React from 'react';
import PropTypes from 'prop-types';
import useSlug from '../../hooks/data/useSlug';
import useRetroToken from '../../hooks/data/useRetroToken';
import PasswordPage from '../password/PasswordPage';

export default function withRetroTokenForSlug(Component) {
  const Wrapped = ({ slug, ...params }) => {
    const [retroId, slugError] = useSlug(slug);
    const [retroToken, tokenError] = useRetroToken(retroId);

    const error = slugError || tokenError;

    if (retroId && !retroToken && !error) {
      return (<PasswordPage slug={slug} retroId={retroId} />);
    }

    return (
      <Component
        slug={slug}
        retroId={retroId}
        retroToken={retroToken}
        retroTokenError={error}
        {...params}
      />
    );
  };

  Wrapped.propTypes = {
    slug: PropTypes.string.isRequired,
  };

  return Wrapped;
}
