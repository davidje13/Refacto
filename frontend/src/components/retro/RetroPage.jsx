import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import RetroCreatePage from '../retro-create/RetroCreatePage';
import './RetroPage.less';

const RetroPage = ({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}) => {
  const [
    retro,
    retroDispatch,
    retroError,
  ] = useRetroReducer(retroId, retroToken);

  const retroName = retro?.name || slug;

  if (retroTokenError === 'not found') {
    return (<RetroCreatePage defaultSlug={slug} />);
  }

  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retroName} - Refacto`}
        title={retroName}
        links={[{ label: 'Archives', action: `/retros/${slug}/archives` }]}
      />
      <Loader
        loading={!retro}
        error={retroTokenError || retroError}
        Component={RetroFormatPicker}
        retroData={retro?.data}
        retroState={retro?.state}
        dispatch={retroDispatch}
      />
    </article>
  );
};

RetroPage.propTypes = {
  slug: PropTypes.string.isRequired,
  retroId: nullable(PropTypes.string).isRequired,
  retroToken: nullable(PropTypes.string).isRequired,
  retroTokenError: PropTypes.string,
};

RetroPage.defaultProps = {
  retroTokenError: null,
};

forbidExtraProps(RetroPage);

export default React.memo(withRetroTokenForSlug(RetroPage));
