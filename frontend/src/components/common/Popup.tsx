import {
  type FunctionComponent,
  type ReactNode,
  type SyntheticEvent,
  useId,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useEvent } from '../../hooks/useEvent';
import './Popup.css';

interface PropsT {
  title: string;
  hideTitle?: boolean;
  keys?: Record<string, () => void>;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export const Popup: FunctionComponent<PropsT> = ({
  title,
  hideTitle = false,
  keys,
  isOpen,
  onClose,
  children,
}) => {
  const titleID = useId();
  const [dialog] = useState(() => document.createElement('dialog'));
  const [lagDisplay, setLagDisplay] = useState(false);
  const showContent = isOpen || lagDisplay;

  const handleCancel = useEvent((e: Event) => {
    e.preventDefault();
    onClose();
  });

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

  useLayoutEffect(() => {
    dialog.className = 'popup-content';
    dialog.setAttribute('aria-labelledby', titleID);
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialog, titleID, handleCancel, handleKeyDown]);

  useLayoutEffect(() => {
    if (!showContent) {
      return;
    }
    document.body.append(dialog);
    return () => dialog.remove();
  }, [dialog, showContent]);

  useLayoutEffect(() => {
    if (isOpen) {
      setLagDisplay(true);
      dialog.showModal();
      return () => dialog.close();
    } else {
      const tm = setTimeout(() => setLagDisplay(false), 500);
      return () => clearTimeout(tm);
    }
  }, [dialog, isOpen]);

  if (!showContent) {
    return null;
  }

  // create the modal as a portal so that events will still work inside it
  // (note: this is not required in preact, so could be simplified if we swap library)
  const portal = createPortal(
    <>
      <h1 id={titleID} className={hideTitle ? 'hidden' : ''}>
        {title}
      </h1>
      {children}
    </>,
    dialog,
  );
  // React propagates events through portals, so we must block them from reaching parent components
  // See https://github.com/facebook/react/issues/11387
  return (
    <div
      onMouseDown={stopProp}
      onMouseUp={stopProp}
      onKeyDown={stopProp}
      onKeyUp={stopProp}
      onSubmit={stopProp}
    >
      {portal}
    </div>
  );
};

function stopProp(e: SyntheticEvent) {
  e.stopPropagation();
}
