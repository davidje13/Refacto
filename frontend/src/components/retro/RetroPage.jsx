import React from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import Loader from '../common/Loader';
import useSlug from '../../hooks/data/useSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './RetroPage.less';

const RetroPage = ({ slug }) => {
  const [retroState, retroDispatch] = useRetroReducer(useSlug(slug)?.id);

  const retro = retroState?.retro;
  const retroName = retro?.name || slug;

  return (
    <article className="page-retro">
      <Header
        documentTitle={`${retroName} - Refacto`}
        title={retroName}
        links={[{ label: 'Archives', url: `/retros/${slug}/archives` }]}
      />
      <Loader
        loading={!retro}
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
};

forbidExtraProps(RetroPage);

export default React.memo(RetroPage);
