import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroFromSlug from '../hocs/withRetroFromSlug';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import RetroCreatePage from '../retro-create/RetroCreatePage';
import './RetroPage.less';

const RetroPage = ({
  slug,
  retroState,
  retroDispatch,
  error,
}) => {
  const retro = retroState?.retro;
  const retroName = retro?.name || slug;

  if (error === 'not found') {
    return (<RetroCreatePage defaultSlug={slug} />);
  }

  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retroName} - Refacto`}
        title={retroName}
        links={[{ label: 'Archives', url: `/retros/${slug}/archives` }]}
      />
      <Loader
        loading={!retro}
        error={error}
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
  retroState: nullable(PropTypes.shape({})).isRequired,
  retroDispatch: nullable(PropTypes.func).isRequired,
  error: PropTypes.string,
};

RetroPage.defaultProps = {
  error: null,
};

forbidExtraProps(RetroPage);

export default React.memo(withRetroFromSlug(RetroPage));
