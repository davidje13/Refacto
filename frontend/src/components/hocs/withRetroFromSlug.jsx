import React from 'react';
import PropTypes from 'prop-types';
import useSlug from '../../hooks/data/useSlug';
import useRetroToken from '../../hooks/data/useRetroToken';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import PasswordPage from '../password/PasswordPage';

export default function withRetroFromSlug(Component, readonly = false) {
  const Wrapped = (params) => {
    const { slug } = params;
    const retroId = useSlug(slug)?.id;
    const token = useRetroToken(retroId);
    const [retroState, retroDispatch] = useRetroReducer(retroId, token);

    if (retroId && !token) {
      return (<PasswordPage slug={slug} retroId={retroId} />);
    }

    const childParams = Object.assign({ retroState }, params);
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
