import React from 'react';
import './Loader.less';

interface PropsT<C extends React.ElementType> {
  Component: C;
  componentProps: React.ComponentPropsWithRef<C> | null;
  loadingMessage?: React.ReactNode;
  error?: string | null;
}

export default <C extends React.ElementType>({
  Component,
  componentProps,
  loadingMessage = 'Loading\u2026',
  error,
}: PropsT<C>): React.ReactElement => {
  if (error) {
    return (<div className="loader error">{ error }</div>);
  }

  if (!componentProps) {
    return (<div className="loader">{ loadingMessage }</div>);
  }

  return (<Component {...componentProps} />);
};
