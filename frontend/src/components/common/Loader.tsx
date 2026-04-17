import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type FunctionComponent,
} from 'react';
import { diagnosticsService } from '../../api/api';
import './Loader.css';

export const LoadingIndicator: FunctionComponent = () => (
  <div className="loader">Loading&hellip;</div>
);

export const LoadingError: FunctionComponent<{ error: string }> = ({
  error,
}) => <div className="loader error">{error}</div>;

export const lazyImportError = (
  err: unknown,
): { default: ComponentType<any> } => {
  if (navigator.onLine !== false) {
    diagnosticsService.error('lazy import error', err);
  }

  return {
    default: () => {
      const [disabled, setDisabled] = useState(false);
      const retry = useCallback(() => {
        setDisabled(true);
        setTimeout(() => document.location.reload(), 500);
      }, []);
      useEffect(() => {
        if (disabled) {
          return;
        }
        window.addEventListener('online', retry);
        return () => window.removeEventListener('online', retry);
      }, [disabled, retry]);

      return (
        <div className="loader error">
          <p>Failed to load page.</p>
          {navigator.onLine === false ? (
            <p>
              You do not appear to be connected to the internet. Please check
              your connection.
            </p>
          ) : null}
          <p>
            <button
              disabled={disabled}
              className="global-button primary"
              onClick={retry}
            >
              Retry
            </button>
          </p>
        </div>
      );
    },
  };
};
