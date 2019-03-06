import React from 'react';
import PropTypes from 'prop-types';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../helpers/dataStructurePropTypes';

const formats = new Map();
formats.set('mood', MoodRetro);

export const RetroFormatPicker = ({ retroState, retroData, ...passThrough }) => {
  const RetroType = formats.get(retroData.format) || UnknownRetro;

  return (
    <RetroType
      retroState={retroState}
      retroData={retroData}
      {...passThrough}
    />
  );
};

RetroFormatPicker.propTypes = {
  retroState: PropTypes.shape({}).isRequired,
  retroData: propTypesShapeRetroData.isRequired,
  archive: PropTypes.bool,
  onAddItem: PropTypes.func,
  onVoteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onSetItemDone: PropTypes.func,
  onSetRetroState: PropTypes.func,
};

RetroFormatPicker.defaultProps = {
  archive: false,
  onAddItem: null,
  onVoteItem: null,
  onEditItem: null,
  onDeleteItem: null,
  onSetItemDone: null,
  onSetRetroState: null,
};

forbidExtraProps(RetroFormatPicker);

export default RetroFormatPicker;
