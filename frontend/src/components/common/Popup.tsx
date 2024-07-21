import { type FC, useState, type ReactNode } from 'react';
import Modal from 'react-modal';
import { useEvent } from '../../hooks/useEvent';
import { useListener } from '../../hooks/useListener';
import './Popup.less';

export interface PopupData {
  title: string;
  hideTitle?: boolean;
  content: ReactNode;
  keys?: Record<string, () => void>;
}

interface PropsT {
  data: PopupData | null;
  onClose: () => void;
}

function stopProp(e: Event) {
  e.stopPropagation();
}

export const Popup: FC<PropsT> = ({ data, onClose }) => {
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
    const fn = data?.keys?.[e.key];
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
      onRequestClose={onClose}
      contentRef={setModal}
      aria={{ labelledby: 'modal-heading' }}
    >
      <h1 id="modal-heading" className={data.hideTitle ? 'hidden' : ''}>
        {data.title}
      </h1>
      {data.content}
    </Modal>
  );
};
