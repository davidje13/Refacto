declare module 'react-mock-element' {
  import React from 'react';

  export default function (name: string): () => React.ReactElement;
}
