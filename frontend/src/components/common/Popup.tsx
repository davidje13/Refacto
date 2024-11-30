import {
  type FC,
  type PropsWithChildren,
  useRef,
  useEffect,
  type KeyboardEvent,
  useId,
  useState,
} from 'react';
import { useEvent } from '../../hooks/useEvent';
import './Popup.less';

interface PropsT {
  title: string;
  hideTitle?: boolean;
  keys?: Record<string, () => void>;
  isOpen: boolean;
  onClose: () => void;
}

export const Popup: FC<PropsWithChildren<PropsT>> = ({
  title,
  hideTitle = false,
  keys,
  isOpen,
  onClose,
  children,
}) => {
  const [lagDisplay, setLagDisplay] = useState(false);

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

  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) {
      setLagDisplay(true);
      dialog.current?.showModal();
      return () => dialog.current?.close();
    } else {
      const tm = setTimeout(() => setLagDisplay(false), 500);
      return () => clearTimeout(tm);
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialog}
      className="popup-content"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={handleKeyDown}
      aria-labelledby={id}
    >
      <h1 id={id} className={hideTitle ? 'hidden' : ''}>
        {title}
      </h1>
      {isOpen || lagDisplay ? children : null}
    </dialog>
  );
};
