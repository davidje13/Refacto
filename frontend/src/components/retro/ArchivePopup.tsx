import React from 'react';
import PropTypes from 'prop-types';
import WrappedButton from '../common/WrappedButton';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './ArchivePopup.less';

interface PropsT {
  onConfirm: () => void;
  onCancel: () => void;
}

const ArchivePopup = ({ onConfirm, onCancel }: PropsT): React.ReactElement => (
  <div className="popup-archive">
    <p>Archive and clear this retro?</p>
    <p>
      <WrappedButton onClick={onCancel}>
        Cancel
      </WrappedButton>
      <WrappedButton onClick={onConfirm} className="primary">
        Archive
      </WrappedButton>
    </p>
  </div>
);

ArchivePopup.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

forbidExtraProps(ArchivePopup);

export default React.memo(ArchivePopup);
