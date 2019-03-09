import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { formatDateTime } from '../../time/formatters';

export const ArchiveLink = ({ retroSlug, archiveId, created }) => (
  <Link to={`/retros/${retroSlug}/archives/${archiveId}`}>
    <div className="archive-link">{ formatDateTime(created) }</div>
  </Link>
);

ArchiveLink.propTypes = {
  retroSlug: PropTypes.string.isRequired,
  archiveId: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
};

forbidExtraProps(ArchiveLink);

export default React.memo(ArchiveLink);
