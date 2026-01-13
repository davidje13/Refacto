import type { FunctionComponent } from 'react';
import './Loader.css';

export const LoadingIndicator: FunctionComponent = () => (
  <div className="loader">Loading&hellip;</div>
);

export const LoadingError: FunctionComponent<{ error: string }> = ({
  error,
}) => <div className="loader error">{error}</div>;
