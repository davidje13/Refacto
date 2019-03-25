import React from 'react';
import PropTypes from 'prop-types';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../api/dataStructurePropTypes';

const formats = new Map();
formats.set('mood', MoodRetro);

const RetroFormatPicker = (props) => {
  const { retroData } = props;
  const RetroType = formats.get(retroData.format) || UnknownRetro;

  return (<RetroType {...props} />);
};

RetroFormatPicker.propTypes = {
  retroState: PropTypes.shape({}).isRequired,
  retroData: propTypesShapeRetroData.isRequired,
  dispatch: PropTypes.func,
  archive: PropTypes.bool,
};

RetroFormatPicker.defaultProps = {
  dispatch: null,
  archive: false,
};

forbidExtraProps(RetroFormatPicker);

export default React.memo(RetroFormatPicker);
