import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { formatDateTime } from '../../time/formatters';

export const ArchiveLink = ({ slug, uuid, created }) => (
  <Link to={`/retros/${slug}/archives/${uuid}`}>
    <div className="archive-link">{ formatDateTime(created) }</div>
  </Link>
);

ArchiveLink.propTypes = {
  slug: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
  created: PropTypes.number.isRequired,
};

forbidExtraProps(ArchiveLink);

export default React.memo(ArchiveLink);
