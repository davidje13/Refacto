import React, { useState } from 'react';
import Modal from 'react-modal';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';
import useListener from '../../hooks/useListener';
import './Popup.less';

export interface PopupData {
  title: string;
  hideTitle?: boolean;
  content: React.ReactNode;
  keys?: Record<string, () => void>;
}

interface PropsT {
  data: PopupData | null;
  onClose?: () => void;
}

function stopProp(e: Event): void {
  e.stopPropagation();
}

export default ({
  data,
  onClose,
}: PropsT): React.ReactElement | null => {
  const keys = data?.keys ?? {};

  const closeHandler = useParameterlessCallback(onClose);
  const [modal, setModal] = useState<HTMLDivElement>();
  useListener(modal, 'mousedown', stopProp);
  useListener(modal, 'mouseup', stopProp);
  useListener(modal, 'keyup', stopProp);
  useListener(modal, 'keypress', stopProp);

  useListener(modal, 'keydown', (e: KeyboardEvent) => {
    e.stopPropagation();
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
      <h1 id="modal-heading" className={data.hideTitle ? 'hidden' : ''}>{ data.title }</h1>
      { data.content }
    </Modal>
  );
};
