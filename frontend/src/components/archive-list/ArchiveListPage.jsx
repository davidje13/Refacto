import React from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import Loader from '../common/Loader';
import useSlug from '../../hooks/data/useSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import ArchiveList from './ArchiveList';
import './ArchiveListPage.less';

const ArchiveListPage = ({ slug }) => {
  const [retroState] = useRetroReducer(useSlug(slug)?.id);

  const retro = retroState?.retro;
  const retroName = retro?.name || slug;

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retroName} - Refacto`}
        title={`${retroName} Archives`}
        backLink={{ label: 'Back to Retro', url: `/retros/${slug}` }}
      />
      <Loader
        loading={!retro}
        Component={ArchiveList}
        retro={retro}
      />
    </article>
  );
};

ArchiveListPage.propTypes = {
  slug: PropTypes.string.isRequired,
};

forbidExtraProps(ArchiveListPage);

export default React.memo(ArchiveListPage);
