import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroFromSlug from '../hocs/withRetroFromSlug';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import ArchiveList from './ArchiveList';
import './ArchiveListPage.less';

const ArchiveListPage = ({ slug, retroState, error }) => {
  const retro = retroState?.retro;
  const retroName = retro?.name || slug;

  // TODO: archives are not stored in retro data any more

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retroName} - Refacto`}
        title={`${retroName} Archives`}
        backLink={{ label: 'Back to Retro', url: `/retros/${slug}` }}
      />
      <Loader
        loading={!retro?.archives}
        error={error}
        Component={ArchiveList}
        slug={slug}
        archives={retro?.archives}
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
