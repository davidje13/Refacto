import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';

const formats = new Map();
formats.set('mood', MoodRetro);

export class Retro extends React.PureComponent {
  static propTypes = {
    retro: propTypesShapeRetro.isRequired,
  };

  render() {
    const { retro } = this.props;
    const { name, format } = retro;

    const RetroType = formats.get(format) || UnknownRetro;

    return (
      <React.Fragment>
        <Helmet>
          <title>{name} - Refacto</title>
        </Helmet>
        <h1 className="retro-name">{name}</h1>
        <RetroType retro={retro} />
      </React.Fragment>
    );
  }
}

forbidExtraProps(Retro);

const mapStateToProps = (state) => ({
  retro: state.activeRetro.retro,
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Retro);
