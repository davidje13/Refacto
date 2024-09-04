import { type FC, useState, type PropsWithChildren } from 'react';
import Modal from 'react-modal';
import { useEvent } from '../../hooks/useEvent';
import { useListener } from '../../hooks/useListener';
import './Popup.less';

interface PropsT {
  title: string;
  hideTitle?: boolean;
  keys?: Record<string, () => void>;
  isOpen: boolean;
  onClose: () => void;
}

function stopProp(e: Event) {
  e.stopPropagation();
}

export const Popup: FC<PropsWithChildren<PropsT>> = ({
  title,
  hideTitle = false,
  keys,
  isOpen,
  onClose,
  children,
}) => {
  const handleKeyDown = useEvent((e: KeyboardEvent) => {
    e.stopPropagation();
    const t = e.target as Element;
    if (
      t.tagName === 'INPUT' ||
      t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT'
    ) {
      return;
    }
    const fn = keys?.[e.key];
    if (fn) {
      e.preventDefault();
      if (!e.repeat) {
        fn();
      }
    }
  });

  const [modal, setModal] = useState<HTMLDivElement>();
  useListener(modal, 'mousedown', stopProp);
  useListener(modal, 'mouseup', stopProp);
  useListener(modal, 'keyup', stopProp);
  useListener(modal, 'keypress', stopProp);
  useListener(modal, 'keydown', handleKeyDown);

  return (
    <Modal
      isOpen={isOpen}
      portalClassName=""
      overlayClassName="popup-overlay"
      className="popup-content"
      bodyOpenClassName={undefined}
      onRequestClose={onClose}
      contentRef={setModal}
      aria={{ labelledby: 'modal-heading' }}
    >
      <h1 id="modal-heading" className={hideTitle ? 'hidden' : ''}>
        {title}
      </h1>
      {children}
    </Modal>
  );
};
