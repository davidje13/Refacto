import { useRef, useEffect, memo } from 'react';

interface PropsT {
  tag: string;
}

export const Anchor = memo(({ tag }: PropsT) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const anchor = window.location.hash.substr(1);
    if (anchor === tag && ref.current && ref.current.scrollIntoView) {
      ref.current.scrollIntoView();
    }
  }, [ref, tag]);

  return <span ref={ref} id={tag} />;
});
