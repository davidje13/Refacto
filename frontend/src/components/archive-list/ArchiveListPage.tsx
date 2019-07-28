import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import useArchiveList from '../../hooks/data/useArchiveList';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import ArchiveList from './ArchiveList';
import './ArchiveListPage.less';

interface PropsT {
  slug: string;
  retroId: string | null;
  retroToken: string | null;
  retroTokenError?: string | null;
}

const ArchiveListPage = ({
  slug,
  retroId,
  retroToken,
  retroTokenError,
}: PropsT): React.ReactElement => {
  const [retro] = useRetroReducer(retroId, retroToken);
  const [archives, archivesError] = useArchiveList(retroId, retroToken);

  const retroName = retro ? retro.name : slug; // TODO TypeScript#16

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retroName} - Refacto`}
        title={`${retroName} Archives`}
        backLink={{ label: 'Back to Retro', action: `/retros/${slug}` }}
      />
      <Loader<typeof ArchiveList>
        error={retroTokenError || archivesError}
        Component={ArchiveList}
        componentProps={archives ? {
          slug,
          archives,
        } : null}
      />
    </article>
  );
};

ArchiveListPage.propTypes = {
  slug: PropTypes.string.isRequired,
  retroId: nullable(PropTypes.string).isRequired,
  retroToken: nullable(PropTypes.string).isRequired,
  retroTokenError: PropTypes.string,
};

ArchiveListPage.defaultProps = {
  retroTokenError: null,
};

forbidExtraProps(ArchiveListPage);

export default React.memo(withRetroTokenForSlug(ArchiveListPage));
