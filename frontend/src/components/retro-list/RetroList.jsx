import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RetroLink from './RetroLink';

export class RetroList extends React.PureComponent {
  static propTypes = {
    retros: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  render() {
    const { retros } = this.props;

    if (!retros.length) {
      return (
        <p>You do not have any retros yet!</p>
      );
    }

    return (
      <ul className="retros">
        {retros.map(({ name, slug }) => (
          <li key={slug}>
            <RetroLink name={name} slug={slug} />
          </li>
        ))}
      </ul>
    );
  }
}

const mapStateToProps = (state) => ({
  retros: state.retroList.retros,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RetroList);
