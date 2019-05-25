import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroFromSlug from '../hocs/withRetroFromSlug';
import useArchiveList from '../../hooks/data/useArchiveList';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import ArchiveList from './ArchiveList';
import './ArchiveListPage.less';

const ArchiveListPage = ({ slug, retroState, error }) => {
  const [archiveListState, archivesError] = useArchiveList(retroState);
  const retroName = retroState?.retro?.name || slug;

  const archives = archiveListState?.archives;

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retroName} - Refacto`}
        title={`${retroName} Archives`}
        backLink={{ label: 'Back to Retro', url: `/retros/${slug}` }}
      />
      <Loader
        loading={!archives}
        error={archivesError || error}
        Component={ArchiveList}
        slug={slug}
        archives={archives}
      />
    </article>
  );
};

ArchiveListPage.propTypes = {
  slug: PropTypes.string.isRequired,
  retroState: nullable(PropTypes.shape({})).isRequired,
  error: PropTypes.string,
};

ArchiveListPage.defaultProps = {
  error: null,
};

forbidExtraProps(ArchiveListPage);

export default React.memo(withRetroFromSlug(ArchiveListPage, true));
