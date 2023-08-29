import React, { memo } from 'react';
import Warning from '../../../resources/warning.svg';
import './Alert.less';

interface PropsT {
  show?: boolean;
  warning?: boolean;
  message?: string | null;
  children?: React.ReactChild[];
}

export default memo(
  ({ show, warning = false, message = null, children }: PropsT) =>
    show !== false && (message || children) ? (
      <div className={`alert-message ${warning ? 'warning' : 'error'}`}>
        <Warning title={warning ? 'Warning' : 'Error'} />
        {message}
        {children}
      </div>
    ) : null,
);
