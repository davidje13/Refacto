import React from 'react';
import PropTypes from 'prop-types';
import { RetroItem } from 'refacto-entities';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../api/dataStructurePropTypes';
import { RetroSpec } from '../../actions/retro';

interface ChildPropsT {
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: object;
  dispatch?: (spec: RetroSpec) => void;
  onComplete: () => void;
  archive: boolean;
}

interface PropsT extends ChildPropsT {
  retroFormat: string;
}

const formats = new Map<string, React.ComponentType<ChildPropsT>>();
formats.set('mood', MoodRetro);

const RetroFormatPicker = ({ retroFormat, ...props }: PropsT): React.ReactElement => {
  const RetroType = formats.get(retroFormat) || UnknownRetro;

  return (<RetroType {...props} />);
};

RetroFormatPicker.propTypes = {
  retroFormat: PropTypes.string.isRequired,
  retroOptions: PropTypes.shape({}).isRequired,
  retroItems: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  retroState: PropTypes.shape({}).isRequired,
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
