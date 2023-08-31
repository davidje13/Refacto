import { memo, ReactNode } from 'react';
import Warning from '../../../resources/warning.svg';
import './Alert.less';

interface PropsT {
  show?: boolean;
  warning?: boolean;
  message?: string | undefined;
  children?: ReactNode;
}

export const Alert = memo(
  ({ show, warning = false, message, children }: PropsT) =>
    show !== false && (message || children) ? (
      <div className={`alert-message ${warning ? 'warning' : 'error'}`}>
        <Warning title={warning ? 'Warning' : 'Error'} />
        {message}
        {children}
      </div>
    ) : null,
);
