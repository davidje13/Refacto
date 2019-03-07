import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ArchiveLink from './ArchiveLink';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';

function archiveCreatedComparator(a, b) {
  // sort newer-to-older
  return b.created - a.created;
}

function sortArchives(archives) {
  const sorted = archives.slice();
  sorted.sort(archiveCreatedComparator);
  return sorted;
}

export const ArchiveList = ({ retro: { slug, archives } }) => {
  if (!archives.length) {
    return (
      <p>This retro has no archives.</p>
    );
  }

  return (
    <React.Fragment>
      <h1>Retro Archives</h1>
      <Link to={`/retros/${slug}`}>Back to Retro</Link>
      <ul className="archives">
        { sortArchives(archives).map(({ uuid, created }) => (
          <li key={uuid}>
            <ArchiveLink slug={slug} uuid={uuid} created={created} />
          </li>
        )) }
      </ul>
    </React.Fragment>
  );
};

ArchiveList.propTypes = {
  retro: propTypesShapeRetro.isRequired,
};

forbidExtraProps(ArchiveList);

const mapStateToProps = (state) => ({
  retro: state.activeRetro.retro,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArchiveList);
