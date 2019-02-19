import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

export class Retro extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };

  render() {
    const { name } = this.props;

    return (
      <React.Fragment>
        <Helmet>
          <title>{name} - Refacto</title>
        </Helmet>
        <div className="retro-name">{name}</div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  name: state.activeRetro.name,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Retro);
