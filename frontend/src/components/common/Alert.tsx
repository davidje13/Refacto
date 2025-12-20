import { memo, type ReactNode } from 'react';
import Warning from '../../../resources/warning.svg';
import './Alert.css';

interface PropsT {
  warning?: boolean;
  message?: ReactNode | undefined;
}

export const Alert = memo(({ warning = false, message }: PropsT) =>
  message ? (
    <div className={`alert-message ${warning ? 'warning' : 'error'}`}>
      <Warning
        title={warning ? 'Warning' : 'Error'}
        aria-label={warning ? 'Warning' : 'Error'}
        role="img"
      />
      {message}
    </div>
  ) : null,
);
