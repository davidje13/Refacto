declare module '*.svg' {
  import type { FunctionComponent, SVGAttributes } from 'react';

  const ReactComponent: FunctionComponent<
    SVGAttributes<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}
