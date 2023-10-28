import {
  ReactNode,
  ElementType,
  ReactElement,
  ComponentPropsWithRef,
} from 'react';
import './Loader.less';

interface PropsT<C extends ElementType> {
  Component: C;
  componentProps: ComponentPropsWithRef<C> | null;
  loadingMessage?: ReactNode;
  error?: string | null;
}

export const Loader = <C extends ElementType>({
  Component,
  componentProps,
  loadingMessage = 'Loading\u2026',
  error,
}: PropsT<C>): ReactElement => {
  if (error) {
    return <div className="loader error">{error}</div>;
  }

  if (!componentProps) {
    return <div className="loader">{loadingMessage}</div>;
  }

  return <Component {...componentProps} />;
};
