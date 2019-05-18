import React, { useLayoutEffect, useRef } from 'react';

const mockPropStorage = new WeakMap();

Object.defineProperty(HTMLElement.prototype, 'mockProps', {
  configurable: true,
  get: function getMockProps() {
    const props = mockPropStorage.get(this);
    if (!props) {
      throw new Error('Cannot get mockProps of a non-mocked element');
    }
    return props;
  },
});

export default (tagName) => (props) => {
  const ref = useRef();
  useLayoutEffect(() => {
    mockPropStorage.set(ref.current, props);
  }, [ref, props]);

  return React.createElement(tagName, { ref });
};
