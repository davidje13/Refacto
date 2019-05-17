import React, { useLayoutEffect, useRef } from 'react';
import mockPropStorage from './mockPropStorage';

export default (tagName) => (props) => {
  const ref = useRef();
  useLayoutEffect(() => {
    mockPropStorage.set(ref.current, props);
  }, [ref, props]);

  return React.createElement(tagName, { ref });
};
