import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import './FaceIcon.less';

const favicons: Record<string, string> = {
  happy: '\uD83D\uDE03',
  meh: '\uD83E\uDD28',
  sad: '\uD83D\uDE22',
};

interface PropsT {
  type: keyof typeof favicons;
}

const FaceIcon = ({ type }: PropsT): React.ReactElement => (
  <div className="face-icon">
    { favicons[type] }
  </div>
);

FaceIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

forbidExtraProps(FaceIcon);

export default React.memo(FaceIcon);
