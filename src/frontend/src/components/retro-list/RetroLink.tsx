import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'wouter';
import forbidExtraProps from '../../helpers/forbidExtraProps';

interface PropsT {
  name: string;
  slug: string;
}

const RetroLink = ({ name, slug }: PropsT): React.ReactElement => (
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
