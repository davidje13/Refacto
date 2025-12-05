import { memo, type ReactNode } from 'react';
import Warning from '../../../resources/warning.svg';
import './Alert.css';

interface PropsT {
  warning?: boolean;
  message?: ReactNode | undefined;
  suffix?: ReactNode;
}

export const Alert = memo(({ warning = false, message, suffix }: PropsT) =>
  message ? (
    <div className={`alert-message ${warning ? 'warning' : 'error'}`}>
      <Warning
        title={warning ? 'Warning' : 'Error'}
        aria-label={warning ? 'Warning' : 'Error'}
        role="img"
      />
      {message}
      {suffix}
    </div>
  ) : null,
);
