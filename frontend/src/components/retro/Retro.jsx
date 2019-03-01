import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';

const formats = new Map();
formats.set('mood', MoodRetro);

export const Retro = ({ retro }) => {
  const { name, format } = retro;

  const RetroType = formats.get(format) || UnknownRetro;

  return (
    <React.Fragment>
      <Helmet>
        <title>{name} - Refacto</title>
      </Helmet>
      <header>
        <h1 className="retro-name">{name}</h1>
      </header>
      <RetroType retro={retro} />
    </React.Fragment>
  );
};

Retro.propTypes = {
  retro: propTypesShapeRetro.isRequired,
};

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
