import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import forbidExtraProps from '../../helpers/forbidExtraProps';

const RetroLink = ({ name, slug }) => (
  <Link to={`/retros/${slug}`}>
    <div className="retro-link">{ name }</div>
  </Link>
);

RetroLink.propTypes = {
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
};

forbidExtraProps(RetroLink);

export default React.memo(RetroLink);
