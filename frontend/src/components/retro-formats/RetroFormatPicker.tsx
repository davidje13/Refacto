import React from 'react';
import PropTypes from 'prop-types';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetroData } from '../../api/dataStructurePropTypes';
import RetroData from '../../data/RetroData';
import { RetroSpec } from '../../actions/retro';

interface PropsT {
  retroState: object;
  retroData: RetroData;
  dispatch?: (spec: RetroSpec) => void;
  onComplete: () => void;
  archive: boolean;
}

const formats = new Map<string, React.ComponentType<PropsT>>();
formats.set('mood', MoodRetro);

const RetroFormatPicker = (props: PropsT): React.ReactElement => {
  const { retroData } = props;
  const RetroType = formats.get(retroData.format) || UnknownRetro;

  return (<RetroType {...props} />);
};

RetroFormatPicker.propTypes = {
  retroState: PropTypes.shape({}).isRequired,
  retroData: propTypesShapeRetroData.isRequired,
  dispatch: PropTypes.func,
  onComplete: PropTypes.func,
  archive: PropTypes.bool,
};

RetroFormatPicker.defaultProps = {
  dispatch: undefined,
  onComplete: (): void => {},
  archive: false,
};

forbidExtraProps(RetroFormatPicker);

export default React.memo(RetroFormatPicker);
