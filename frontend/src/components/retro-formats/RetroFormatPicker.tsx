import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Retro, RetroItem } from 'refacto-entities';
import UnknownRetro from './unknown/UnknownRetro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../api/dataStructurePropTypes';
import { Dispatch } from '../../api/SharedReducer';

interface ChildPropsT {
  retroOptions: Record<string, unknown>;
  retroItems: RetroItem[];
  retroState: object;
  dispatch?: Dispatch<Retro>;
  onComplete?: () => void;
  archive: boolean;
}

interface PropsT extends ChildPropsT {
  retroFormat: string;
}

const formats = new Map<string, React.ComponentType<ChildPropsT>>();
formats.set('mood', React.lazy(() => import('./mood/MoodRetro')));

const RetroFormatPicker = ({ retroFormat, ...props }: PropsT): React.ReactElement => {
  const RetroType = formats.get(retroFormat) || UnknownRetro;

  return (
    <Suspense fallback="">
      <RetroType {...props} />
    </Suspense>
  );
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
  onComplete: undefined,
  archive: false,
};

forbidExtraProps(RetroFormatPicker);

export default React.memo(RetroFormatPicker);
