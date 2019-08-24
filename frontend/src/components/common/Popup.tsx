import React, { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './Popup.less';
import useListener from '../../hooks/useListener';

interface PropsT {
  data: null | {
    title: string;
    content: React.ReactNode;
    keys?: Record<string, () => void>;
  };
  onClose?: () => void;
}

const Popup = ({ data, onClose }: PropsT): React.ReactElement | null => {
  const keys = data ? data.keys || {} : {}; // TODO TypeScript#16

  const closeHandler = useParameterlessCallback(onClose);
  const [modal, setModal] = useState<HTMLDivElement>();
  useListener(modal, 'keydown', (e: KeyboardEvent) => {
    const t = e.target as Element;
    if (
      t.tagName === 'INPUT' ||
      t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT'
    ) {
      return;
    }
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) {
        fn();
      }
    }
    // TODO: should use keys/values of keys, rather than
    // object itself, to avoid unnecessary rebinding
  }, [keys]);

  if (!data) {
    return null;
  }

  return (
    <Modal
      isOpen
      portalClassName=""
      overlayClassName="popup-overlay"
      className="popup-content"
      bodyOpenClassName={undefined}
      onRequestClose={closeHandler}
      contentRef={setModal}
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
  onClose: undefined,
};

forbidExtraProps(Popup);

export default Popup;
