import React, { useRef, useEffect } from 'react';

interface PropsT {
  tag: string;
}

const Anchor = ({ tag }: PropsT): React.ReactElement => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const anchor = window.location.hash.substr(1);
    if (anchor === tag && ref.current && ref.current.scrollIntoView) {
      ref.current.scrollIntoView();
    }
  }, [ref, tag]);

  return (<span ref={ref} id={tag} />);
};

export default React.memo(Anchor);
