import {
  useRef,
  useEffect,
  memo,
  type PropsWithChildren,
  type ElementType,
} from 'react';
import './Anchor.css';

interface PropsT {
  tag?: ElementType;
  name: string;
  className?: string;
}

export const Anchor = memo(
  ({
    tag: Tag = 'span',
    name,
    className = '',
    children,
  }: PropsWithChildren<PropsT>) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      const anchor = window.location.hash.substring(1);
      if (anchor === name && ref.current && ref.current.scrollIntoView) {
        ref.current.scrollIntoView();
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
