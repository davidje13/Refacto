import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class RetroLink extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  };

  render() {
    const { name, slug } = this.props;

    return (
      <Link to={`/retros/${slug}`}>
        <div className="retro-link">{name}</div>
      </Link>
    );
  }
}
