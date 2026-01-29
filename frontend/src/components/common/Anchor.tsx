import {
  useRef,
  useEffect,
  memo,
  type ElementType,
  type ReactNode,
} from 'react';
import './Anchor.css';

interface PropsT {
  tag?: ElementType;
  name: string;
  onVisit?: (target: HTMLElement) => void;
  className?: string;
  children?: ReactNode;
}

export const Anchor = memo(
  ({ tag: Tag = 'span', name, onVisit, className = '', children }: PropsT) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      const anchor = document.location.hash.substring(1);
      if (anchor === name && ref.current) {
        ref.current.scrollIntoView?.();
        onVisit?.(ref.current);
      }
    }, [ref, name]);

    return (
      <Tag ref={ref} id={name} className={`${className} anchor`}>
        {children}
        <a href={`#${name}`} aria-label="Link to this" />
      </Tag>
    );
  },
);
