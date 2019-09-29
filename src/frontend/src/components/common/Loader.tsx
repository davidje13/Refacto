import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './Loader.less';

interface PropsT<C, P> {
  Component: C;
  componentProps: P | null;
  loadingMessage?: React.ReactNode;
  error?: string | null;
}

function Loader<C extends React.ElementType>({
  Component,
  componentProps,
  loadingMessage,
  error,
}: PropsT<C, React.ComponentPropsWithRef<C>>): React.ReactElement {
  if (error) {
    return (<div className="loader error">{ error }</div>);
  }

  if (!componentProps) {
    return (<div className="loader">{ loadingMessage }</div>);
  }

  return (<Component {...componentProps} />);
}

Loader.propTypes = {
  Component: PropTypes.elementType.isRequired,
  componentProps: nullable(PropTypes.shape({})).isRequired,
  loadingMessage: PropTypes.node,
  error: PropTypes.string,
};

Loader.defaultProps = {
  loadingMessage: 'Loading\u2026',
  error: null,
};

forbidExtraProps(Loader);

export default Loader;
