import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import './FaceIcon.less';

const favicons = {
  happy: '\uD83D\uDE03',
  meh: '\uD83E\uDD28',
  sad: '\uD83D\uDE22',
};

const FaceIcon = ({ type }) => (
  <div className="face-icon">
    { favicons[type] }
  </div>
);

FaceIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

forbidExtraProps(FaceIcon);

export default React.memo(FaceIcon);
