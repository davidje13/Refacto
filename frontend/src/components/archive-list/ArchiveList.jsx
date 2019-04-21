import React from 'react';
import PropTypes from 'prop-types';
import ArchiveLink from './ArchiveLink';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeArchiveSummary } from '../../api/dataStructurePropTypes';

function archiveCreatedComparator(a, b) {
  // sort newer-to-older
  return b.created - a.created;
}

function sortArchives(archives) {
  const sorted = archives.slice();
  sorted.sort(archiveCreatedComparator);
  return sorted;
}

const ArchiveList = ({ slug, archives }) => {
  if (!archives.length) {
    return (<p>This retro has no archives.</p>);
  }

  return (
    <ul className="archives">
      { sortArchives(archives).map(({ id, created }) => (
        <li key={id}>
          <ArchiveLink retroSlug={slug} archiveId={id} created={created} />
        </li>
      )) }
    </ul>
  );
};

ArchiveList.propTypes = {
  slug: PropTypes.string.isRequired,
  archives: PropTypes.arrayOf(propTypesShapeArchiveSummary).isRequired,
};

forbidExtraProps(ArchiveList);

export default React.memo(ArchiveList);
