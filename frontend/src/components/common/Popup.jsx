import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './Popup.less';

const Popup = ({ data, onClose }) => {
  const closeHandler = useParameterlessCallback(onClose);
  if (!data) {
    return null;
  }

  return (
    <Modal
      isOpen
      portalClassName=""
      overlayClassName="popup-overlay"
      className="popup-content"
      bodyOpenClassName={null}
      onRequestClose={closeHandler}
      aria={{ labelledby: 'modal-heading' }}
    >
      <h1 id="modal-heading">{ data.title }</h1>
      { data.content }
    </Modal>
  );
};

Popup.propTypes = {
  data: nullable(PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  })).isRequired,
  onClose: PropTypes.func,
};

Popup.defaultProps = {
  onClose: null,
};

forbidExtraProps(Popup);

export default Popup;
