declare module '*.svg' {
  import { type FC, type SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement> | { title?: string }>;

  export default ReactComponent;
}
