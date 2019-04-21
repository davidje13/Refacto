import React from 'react';
import PropTypes from 'prop-types';
import useSlug from '../../hooks/data/useSlug';
import useRetroToken from '../../hooks/data/useRetroToken';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import PasswordPage from '../password/PasswordPage';

export default function withRetroFromSlug(Component, readonly = false) {
  const Wrapped = (params) => {
    const { slug } = params;
    const [retroId, slugError] = useSlug(slug);
    const [retroToken, tokenError] = useRetroToken(retroId);
    const [
      retroState,
      retroDispatch,
      retroError,
    ] = useRetroReducer(retroId, retroToken);

    const error = slugError || tokenError || retroError;

    if (retroId && !retroToken && !error) {
      return (<PasswordPage slug={slug} retroId={retroId} />);
    }

    const childParams = Object.assign({ retroState, error }, params);
    if (!readonly) {
      childParams.retroDispatch = retroDispatch;
    }

    return (<Component {...childParams} />);
  };

  Wrapped.propTypes = {
    slug: PropTypes.string.isRequired,
  };

  return Wrapped;
}
